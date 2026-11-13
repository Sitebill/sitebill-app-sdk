// Проверка пакета приложения. Правила повторяют установщик ядра (App\Apps\AppInstaller, AppManifest):
// всё, что отвергнет он, должно быть видно разработчику до загрузки.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

// Поля типа по строкам: новое поле начинается строкой «имя(» или «имя:» вне круглых скобок. Аргументы поля могут быть
// записаны в несколько строк (name: String! @rules(...)), и такая строка — не новое поле.
function splitFields(body) {
  const fields = []
  let depth = 0
  for (const line of body.split('\n')) {
    const bare = line.replace(/"(?:[^"\\]|\\.)*"/g, '""')
    if ((depth === 0 && /^\s*[A-Za-z_]\w*\s*[(:]/.test(bare)) || !fields.length) fields.push(line)
    else fields[fields.length - 1] += '\n' + line
    depth += (bare.match(/\(/g) || []).length - (bare.match(/\)/g) || []).length
  }
  return fields
}

export const MAX_FILES = 3000
export const MAX_UNPACKED = 64 * 1024 * 1024
const PATH_RE = /^[A-Za-z0-9_][A-Za-z0-9._-]*(\/[A-Za-z0-9_][A-Za-z0-9._-]*)*$/
const ID_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const VERSION_RE = /^\d+\.\d+\.\d+$/
const LOCALES = ['ru', 'en', 'sr', 'tg']
// Корневые каталоги разработчика, в пакет не едут (в api/ и web/ одноимённые папки остаются).
const SKIP_ROOT_DIRS = new Set(['node_modules', 'dist', 'tests', 'vendor'])

/** Файлы пакета (как их возьмёт pack): без служебных точечных, node_modules, корневого vendor и готовых архивов. */
export function listFiles(root) {
  const out = []
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (name.startsWith('.')) continue
      const abs = join(dir, name)
      const rel = relative(root, abs).split(sep).join('/')
      const st = statSync(abs)
      if (st.isDirectory()) {
        if (name === 'node_modules' || (!rel.includes('/') && SKIP_ROOT_DIRS.has(name))) continue
        walk(abs)
      } else if (!/\.(sbapp|zip)$/.test(name) && !['composer.lock', 'package-lock.json'].includes(name)) {
        out.push({ rel, abs, size: st.size })
      }
    }
  }
  walk(root)
  return out
}

export function readManifest(root) {
  const file = join(root, 'manifest.json')
  if (!existsSync(file)) throw new Error('В корне проекта нет manifest.json')
  return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''))
}

export const tablePrefixFor = (id) => 'app_' + id.replace(/[.-]/g, '_') + '_'

/** Тело блока { … } после позиции from — для разбора extend type Mutation. */
function inBraces(text, from) {
  const open = text.indexOf('{', from)
  if (open < 0) return ''
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}' && --depth === 0) return text.slice(open + 1, i)
  }
  return text.slice(open + 1)
}

/** @returns {{ errors: string[], warnings: string[], manifest: any|null, files: any[] }} */
export function checkApp(root, { php = 'php' } = {}) {
  const errors = []
  const warnings = []
  let manifest = null
  try { manifest = readManifest(root) } catch (e) { return { errors: [e.message], warnings, manifest: null, files: [] } }
  const m = manifest

  if (typeof m.id !== 'string' || !ID_RE.test(m.id)) errors.push('id: ожидается vendor.name (латиница в нижнем регистре, цифры, дефис)')
  if (typeof m.version !== 'string' || !VERSION_RE.test(m.version)) errors.push('version: ожидается semver X.Y.Z')
  const nm = m.name
  if (!((typeof nm === 'string' && nm) || (nm && typeof nm === 'object' && Object.keys(nm).length))) errors.push('name: строка или {"ru": "...", "en": "..."}')
  if (!m.sdk || (m.sdk.php == null && m.sdk.web == null)) errors.push('sdk: {"php": "1", "web": "1"} — хотя бы одна часть')
  else for (const part of ['php', 'web']) if (m.sdk[part] != null && String(m.sdk[part]) !== '1') errors.push(`sdk.${part}: поддерживается только версия 1`)
  if (m.provider != null && !/^SitebillApps(\\[A-Z][A-Za-z0-9]*){2,}$/.test(m.provider)) errors.push('provider: класс в пространстве имён SitebillApps\\<Vendor>\\<Name>\\…')
  if (m.requires?.host == null) warnings.push('requires.host не указан: пакет попробуют поставить на любую версию платформы')

  const files = listFiles(root)
  if (files.length > MAX_FILES) errors.push(`В пакете больше ${MAX_FILES} файлов`)
  const total = files.reduce((n, f) => n + f.size, 0)
  if (total > MAX_UNPACKED) errors.push(`Распакованный пакет больше ${MAX_UNPACKED / 1048576} МБ`)
  for (const f of files) if (!PATH_RE.test(f.rel)) errors.push(`${f.rel}: недопустимый путь (разрешены латиница, цифры, _ - .)`)

  const prefix = typeof m.id === 'string' ? tablePrefixFor(m.id) : null
  const ns = typeof m.provider === 'string' ? m.provider.split('\\').slice(0, 3).join('\\') : null
  if (m.provider && !existsSync(join(root, 'api/src'))) errors.push('указан provider, но нет каталога api/src')

  // PHP: синтаксис (если php доступен), пространство имён, таблицы, прямые use App\…
  let phpAvailable = true
  for (const f of files) {
    if (!f.rel.endsWith('.php') || f.rel.startsWith('api/vendor/')) continue
    const code = readFileSync(f.abs, 'utf8')
    if (phpAvailable) {
      const r = spawnSync(php, ['-l', f.abs], { encoding: 'utf8' })
      if (r.error) { phpAvailable = false; warnings.push(`php не найден (${php}) — синтаксис PHP не проверен; укажите --php <путь>`) }
      else if (r.status !== 0) { errors.push(`${f.rel}: синтаксическая ошибка PHP`); continue }
    }
    if (f.rel.startsWith('api/src/') && ns && !new RegExp('^namespace\\s+' + ns.replace(/\\/g, '\\\\') + '(\\\\|;)', 'm').test(code)) {
      errors.push(`${f.rel}: пространство имён должно начинаться с ${ns}`)
    }
    if (f.rel.startsWith('api/database/migrations/') && prefix) {
      for (const t of code.matchAll(/Schema::(?:create|table|drop|dropIfExists|rename)\(\s*['"]([^'"]+)['"]/g)) {
        if (!t[1].startsWith(prefix)) errors.push(`${f.rel}: таблица ${t[1]} — приложение работает только с таблицами ${prefix}*`)
      }
    }
    if (/^use\s+App\\/m.test(code)) warnings.push(`${f.rel}: прямой use App\\… — внутренние классы ядра не входят в контракт и могут измениться`)
  }

  // GraphQL: каждое поле мутаций — под @guard и @can (голый @guard пускает любого зарегистрированного посетителя).
  const gql = join(root, 'api/graphql/schema.graphql')
  if (existsSync(gql)) {
    const text = readFileSync(gql, 'utf8')
    for (const hit of text.matchAll(/extend\s+type\s+Mutation\b/g)) {
      const body = inBraces(text, hit.index)
      for (const field of splitFields(body)) {
        const name = field.trim().match(/^([A-Za-z_]\w*)/)?.[1]
        if (!name) continue
        if (!/@guard/.test(field)) warnings.push(`schema.graphql: мутация ${name} без @guard — доступна гостям`)
        else if (!/@can/.test(field)) warnings.push(`schema.graphql: мутация ${name} с голым @guard — доступна любому зарегистрированному посетителю; добавьте @can`)
      }
    }
  }

  // Локали: все четыре языка и одинаковые наборы ключей.
  const locDir = join(root, 'locales')
  if (existsSync(locDir)) {
    const sets = {}
    for (const l of LOCALES) {
      const file = join(locDir, l + '.json')
      if (!existsSync(file)) { errors.push(`locales/${l}.json: нет файла (нужны ru, en, sr, tg)`); continue }
      try { sets[l] = new Set(Object.keys(JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, '')))) }
      catch { errors.push(`locales/${l}.json: невалидный JSON`) }
    }
    const base = sets.ru ?? Object.values(sets)[0]
    if (base) for (const [l, set] of Object.entries(sets)) {
      const miss = [...base].filter((k) => !set.has(k))
      const extra = [...set].filter((k) => !base.has(k))
      if (miss.length) errors.push(`locales/${l}.json: нет ключей ${miss.slice(0, 5).join(', ')}${miss.length > 5 ? '…' : ''}`)
      if (extra.length) warnings.push(`locales/${l}.json: лишние ключи ${extra.slice(0, 5).join(', ')}`)
    }
  } else if (m.admin || m.site) warnings.push('нет каталога locales/ — строки интерфейса приложения без переводов')

  // Web: бандлы существуют, виджеты из манифеста в них упомянуты.
  const widgetsUsed = { admin: Object.values(m.admin?.widgets ?? {}), site: Object.values(m.site?.widgets ?? {}) }
  for (const key of ['admin', 'site']) {
    const rel = m.web?.[key]
    const needs = widgetsUsed[key].length > 0 || (key === 'admin' && (m.admin?.pages?.length ?? 0) > 0)
    if (!rel) { if (needs) errors.push(`манифест описывает ${key}-страницы или виджеты, но web.${key} не указан`); continue }
    const file = join(root, rel)
    if (!existsSync(file)) { errors.push(`web.${key}: файл ${rel} не найден`); continue }
    const code = readFileSync(file, 'utf8')
    for (const w of widgetsUsed[key]) if (!new RegExp('\\b' + w + '\\b').test(code)) warnings.push(`${rel}: не найден виджет ${w} из манифеста`)
    if (/^\s*import\s[^'"]*['"](?![./]|https?:)/m.test(code)) warnings.push(`${rel}: голые импорты (import … from 'пакет') в браузере не разрешатся — используйте host и общий Vue (globalThis.__SB_HOST__.vue)`)
  }

  // Расписание: команда начинается с <id с . → ->:, cron из 5 полей.
  for (const s of m.schedule ?? []) {
    const idp = typeof m.id === 'string' ? m.id.replace(/\./g, '-') + ':' : null
    if (idp && !String(s.command ?? '').startsWith(idp)) errors.push(`schedule: команда ${s.command} должна начинаться с «${idp}»`)
    if (!/^\S+( \S+){4}$/.test(String(s.cron ?? '').trim())) errors.push(`schedule: cron «${s.cron}» — ожидается 5 полей`)
  }

  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)], manifest, files }
}
