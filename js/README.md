# @sitebill/app-sdk

[![npm](https://img.shields.io/npm/v/@sitebill/app-sdk)](https://www.npmjs.com/package/@sitebill/app-sdk) [![license](https://img.shields.io/npm/l/@sitebill/app-sdk)](https://github.com/Sitebill/sitebill-app-sdk/blob/main/LICENSE)

**EN** · Browser side and CLI for **installable apps** of [Sitebill](https://sitebillcms.com/) — the real-estate CMS / SaaS platform (Community Edition). An app is a Laravel (PHP 8.4) + Vue 3 package: own tables, GraphQL, REST, admin pages and site widgets; the admin installs it from a `.sbapp` file and the site picks it up without rebuilding. This package has the typed browser contract (`AppHost`, `defineAdminPages`, `defineWidgets`) and the `sitebill-app` CLI. The PHP side is `composer require sitebill/app-sdk`.
**RU** · Браузерная часть и CLI **устанавливаемых приложений** платформы [Sitebill](https://www.sitebill.ru/) (сайты и CRM для недвижимости, Community Edition). Приложение — пакет Laravel (PHP 8.4) + Vue 3: свои таблицы, GraphQL, REST, страницы админки и виджеты сайта; администратор ставит его из `.sbapp`, пересборка сайта не нужна. Здесь — типы контракта для браузера и CLI `sitebill-app`. PHP-часть — `composer require sitebill/app-sdk`.

> **Preview 0.x** — names may change before 1.0. / Превью: до 1.0 названия могут меняться.

| | |
|---|---|
| 🌍 International | https://sitebillcms.com/ |
| 🇷🇺 Россия и СНГ | https://www.sitebill.ru/ |
| 📦 Source / Исходники | https://github.com/Sitebill/sitebill-app-sdk |
| 🚀 Starter / Шаблон | https://github.com/Sitebill/sitebill-app-starter |
| 🧩 Example app / Пример | https://github.com/Sitebill/sitebill-app-callback |
| 📚 Docs / Документация | https://github.com/rumantic/etownpro-developers-docs/tree/main/docs/apps |

## CLI

Node 22.2+, no dependencies. Run from the app root (where `manifest.json` is). / Запускать из корня приложения.

```bash
npx --package @sitebill/app-sdk sitebill-app check   # same rules as the platform installer + warnings
npx --package @sitebill/app-sdk sitebill-app pack    # check + <id>-<version>.sbapp (zip) for upload
npx --package @sitebill/app-sdk sitebill-app dev --compose ../community/docker-compose.yml
```

- `check` — manifest, file names, `php -l`, namespace, `app_<id>_` table prefix, `@guard` + `@can` on mutations, locales ru/en/sr/tg in sync, bundles and widgets, `schedule`. `--php <path>` if `php` is not in `PATH`.
- `pack` — writes `<id>-<version>.sbapp` (`--out <dir>`); upload it in the admin: **Apps → Installed → Upload your own package** (needs `APPS_ALLOW_UNSIGNED=true`).
- `dev` — copies the app into the Community `api` container, runs `apps install --force` and reinstalls on every save (`--once`, `--service api`).

## Browser contract / Контракт для браузера

```ts
import { defineAdminPages, type AppPageProps } from '@sitebill/app-sdk'
// Vue is shared with the site: never bundle your own copy.
const { defineComponent, h, ref } = globalThis.__SB_HOST__.vue

export const pages = defineAdminPages({
  '': defineComponent({
    props: { host: { type: Object, required: true } },
    setup(props: AppPageProps) {
      const items = ref([])
      props.host.gql('{ acmeCallbackRequests { id phone } }').then(d => { items.value = d.acmeCallbackRequests })
      return () => h('div', props.host.t('title'))
    },
  }),
})
```

`host`: `t`, `locale`, `localePath`, `gql`, `rest`, `toast`, `formatDate`, `user`, `components` (UButton, UInput, UTextarea, UBadge, UIcon, UModal, UCard, USwitch, USelect). Widgets for slots `property.detail`, `home.sections`, `global`, `admin.dashboard` — `defineWidgets`.

## License

MIT. © Sitebill — [sitebillcms.com](https://sitebillcms.com/) · [sitebill.ru](https://www.sitebill.ru/)
