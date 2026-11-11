#!/usr/bin/env node
// CLI устанавливаемых приложений Sitebill.
//
//   sitebill-app check [--php путь]   — проверить пакет теми же правилами, что и установщик платформы
//   sitebill-app pack  [--out каталог] — проверить и собрать <id>-<версия>.sbapp (zip)
//   sitebill-app dev   [--compose docker-compose.yml] [--service api] [--once]
//                                      — ставить приложение в Community-стек и переставлять при каждой правке
//
// Запускать из корня проекта приложения (там manifest.json). Зависимостей нет, нужен Node 22.2+.
import { readFileSync, writeFileSync, mkdirSync, watch, existsSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import { spawnSync } from 'node:child_process'
import { checkApp, listFiles } from '../lib/check.mjs'
import { createZip } from '../lib/zip.mjs'

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 22 || (major === 22 && minor < 2)) {
  console.error(`Нужен Node 22.2 или новее (сейчас ${process.versions.node}).`)
  process.exit(1)
}

const argv = process.argv.slice(2)
const command = argv[0] && !argv[0].startsWith('-') ? argv[0] : 'check'
const flag = (name, def = null) => {
  const i = argv.indexOf('--' + name)
  return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : def
}
const root = resolve(process.cwd())

function runCheck() {
  const { errors, warnings, manifest, files } = checkApp(root, { php: flag('php', 'php') })
  for (const w of warnings) console.warn('  предупреждение: ' + w)
  for (const e of errors) console.error('  ошибка: ' + e)
  if (errors.length) {
    console.error(`Проверка не пройдена: ${errors.length} ошибок.`)
    process.exit(1)
  }
  console.log(`Проверка пройдена: ${manifest.id}@${manifest.version}, файлов ${files.length}${warnings.length ? `, предупреждений ${warnings.length}` : ''}.`)
  return { manifest, files }
}

function pack() {
  const { manifest, files } = runCheck()
  const outDir = resolve(String(flag('out', root)))
  mkdirSync(outDir, { recursive: true })
  const zip = createZip(files.map((f) => ({ name: f.rel, data: readFileSync(f.abs) })))
  const target = join(outDir, `${manifest.id}-${manifest.version}.sbapp`)
  writeFileSync(target, zip)
  console.log(`Пакет: ${target} (${(zip.length / 1024).toFixed(1)} КБ)`)
}

// dev: Community-стек в Docker. Каталог копируется в контейнер и ставится командой apps install --force
// (staging → проверки → миграции → сброс кэшей), как при загрузке пакета из админки.
function dev() {
  const manifest = runCheck().manifest
  const compose = flag('compose', null)
  const service = String(flag('service', 'api'))
  const base = ['compose', ...(compose && compose !== true ? ['-f', resolve(String(compose))] : [])]
  const remote = '/tmp/sitebill-app-dev'
  let busy = false
  let again = false

  const docker = (args, opts = {}) => spawnSync('docker', [...base, ...args], { encoding: 'utf8', ...opts })

  function install() {
    if (busy) { again = true; return }
    busy = true
    const started = Date.now()
    try {
      const { errors } = checkApp(root, { php: flag('php', 'php') })
      if (errors.length) { for (const e of errors) console.error('  ошибка: ' + e); return }
      docker(['exec', '-T', service, 'rm', '-rf', remote])
      // Копируем только состав пакета (без node_modules, vendor и т. п.): пакуем в zip, он кладётся как есть.
      const zip = createZip(listFiles(root).map((f) => ({ name: f.rel, data: readFileSync(f.abs) })))
      const tmp = join(root, `.dev-${basename(root)}.zip`)
      writeFileSync(tmp, zip)
      const cp = docker(['cp', tmp, `${service}:${remote}.zip`])
      if (cp.status !== 0) { console.error(cp.stderr || 'docker compose cp не удалось'); return }
      const r = docker(['exec', '-T', service, 'php', 'artisan', 'apps', 'install', `${remote}.zip`, '--force'])
      process.stdout.write(r.stdout ?? '')
      if (r.status !== 0) console.error(r.stderr || 'apps install завершился с ошибкой')
      else console.log(`Установлено ${manifest.id} за ${((Date.now() - started) / 1000).toFixed(1)} с.`)
    } finally {
      busy = false
      if (again) { again = false; install() }
    }
  }

  install()
  if (flag('once')) return
  console.log('Слежу за файлами… (Ctrl+C — выход)')
  let timer = null
  watch(root, { recursive: true }, (_e, name) => {
    if (!name || /(^|[\\/])(\.|node_modules|vendor|dist)/.test(name) || /\.(sbapp|zip)$/.test(name)) return
    clearTimeout(timer)
    timer = setTimeout(install, 400)
  })
}

try {
  if (command === 'check') runCheck()
  else if (command === 'pack') pack()
  else if (command === 'dev') dev()
  else {
    console.error(`Неизвестная команда «${command}». Доступно: check, pack, dev.`)
    process.exit(2)
  }
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
