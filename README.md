# Sitebill App SDK

**EN** · SDK for **installable apps** for [Sitebill](https://sitebillcms.com/) — the real-estate CMS / SaaS platform (Community Edition). An app is a regular **Laravel (PHP 8.4) + Vue 3** package: its own tables, GraphQL, REST, admin pages and site widgets. The admin installs it from a `.zip` or from the marketplace, and the site picks it up **without rebuilding** — it works like a built-in module.
**RU** · SDK для **устанавливаемых приложений** платформы [Sitebill](https://www.sitebill.ru/) (сайты и CRM для недвижимости, Community Edition). Приложение — обычный пакет **Laravel (PHP 8.4) + Vue 3**: свои таблицы, GraphQL, REST, страницы админки и виджеты сайта. Администратор ставит его из `.zip` или из маркетплейса, и сайт подхватывает его **без пересборки** — как встроенный модуль.

> **Preview 0.x.** The contract is being stabilised: names may change before 1.0. Not yet on Packagist/npm — install from GitHub.
> **Превью 0.x.** Контракт стабилизируется, до 1.0 названия могут меняться. В Packagist и npm пока не опубликовано — ставьте из GitHub.

| | |
|---|---|
| 🌍 International / English | **https://sitebillcms.com/** |
| 🇷🇺 Россия и СНГ | **https://www.sitebill.ru/** |
| 🚀 Starter app / Стартовое приложение | https://github.com/Sitebill/sitebill-app-starter |
| 🎨 Theme SDK / SDK тем | https://github.com/Sitebill/sitebill-theme-sdk |
| 📚 Developer docs / Документация | https://github.com/rumantic/etownpro-developers-docs |

## What is inside / Что внутри

| Part | Package | What |
|---|---|---|
| PHP (repo root) | `sitebill/app-sdk` (Composer) | `AppServiceProvider` — base provider of an app; `AppModel` — tenant-aware Eloquent model; `AppDescriptor`; **Host API** (`Host::site()`, `settings()`, `crm()`, `properties()`, `notifier()`) with DTOs in `Data\` |
| Browser (`js/`) | `@sitebill/app-sdk` (npm) | TypeScript contract of admin pages: `AppHost` (`gql`, `rest`, `t`, `toast`, site UI components), `defineAdminPages`, `AppManifest` type |

## Quick start (EN)

```bash
# Take the starter app (GitHub: "Use this template")
git clone https://github.com/Sitebill/sitebill-app-starter my-app && cd my-app
# Edit manifest.json (id, name, version) and the code; then on your Community install:
docker compose cp . api:/tmp/my-app
docker compose exec api php artisan apps install /tmp/my-app
```

Unsigned packages (your own code, not from the marketplace) are allowed only when the install sets `APPS_ALLOW_UNSIGNED=true`.

### Package layout

```
manifest.json                 # data only: id, version, provider, admin menu and pages
api/src/                      # PHP, namespace SitebillApps\<Vendor>\<Name>\
api/database/migrations/      # only tables app_<id>_* (with tenant_id)
api/graphql/schema.graphql    # extend type Query/Mutation; @guard + @can on mutations
api/routes/api.php            # REST under /api/v1/apps/<id>/
web/admin.mjs                 # ESM: export const pages = { '': Component, 'settings': Component }
locales/{ru,en,sr,tg}.json
```

### PHP

```php
namespace SitebillApps\Acme\Callback;

use Sitebill\AppSdk\AppServiceProvider;

final class CallbackServiceProvider extends AppServiceProvider
{
    protected function bootApp(): void
    {
        $this->policy(Models\Request::class, Policies\RequestPolicy::class);
    }
}
```

```php
final class Request extends \Sitebill\AppSdk\AppModel
{
    protected $table = 'app_acme_callback_requests'; // tenant_id is filled and filtered automatically
}
```

Exceptions in `registerApp()` / `bootApp()` mark the app as *broken* — the site and other apps keep working.

### Host API (PHP, contract 1.1)

Everything an app needs from the platform goes through `Sitebill\AppSdk\Host` — never through platform classes:

| Call | What |
|---|---|
| `Host::site()->current()` | `SiteInfo`: tenant id, name, url, locale, locales (null without a site context) |
| `Host::settings()->get/set/forget/all($appId, …)` | app settings of the current site; `secret()/setSecret()` for API keys (encrypted at rest) |
| `Host::crm()->createLead([...])` | contact (deduplicated by phone/e-mail) + lead in the default pipeline; admins are notified like for the site form |
| `Host::crm()->findOrCreateContact(...)`, `findContact($id)` | CRM contacts as `ContactData` |
| `Host::properties()->find($id)`, `latest($n)` | listings of the current site, read-only (`PropertyData` with public URL) |
| `Host::notifier()->notifyAdmins($appId, $title, $body, $url)` | bell / e-mail / Telegram / Max by each admin's preferences |

```php
use Sitebill\AppSdk\Host;

$lead = Host::crm()->createLead([
    'name' => $name, 'phone' => $phone, 'message' => $comment,
    'property_id' => $propertyId, 'source' => 'acme.callback',
]);
```

In queue jobs and console commands bind the site first (the platform does it for HTTP requests); without it data calls throw.
Require the version in `manifest.json`: `"requires": { "host": ">=1.1" }`.

### Browser

```ts
import { defineAdminPages, type AppPageProps } from '@sitebill/app-sdk'
// Vue is shared with the site: never bundle your own copy
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

## Быстрый старт (RU)

1. Возьмите [стартовое приложение](https://github.com/Sitebill/sitebill-app-starter) («Use this template»).
2. В `manifest.json` поменяйте `id` (`vendor.name`), `name`, `version`, класс `provider`; пространство имён PHP — `SitebillApps\<Vendor>\<Name>\`.
3. Таблицы — только с префиксом `app_<id>_` и колонкой `tenant_id`; модели наследуйте от `AppModel`.
4. Мутации GraphQL — с `@guard` и `@can`: права проверяет сервер.
5. Установка на Community: `php artisan apps install <каталог или zip>` в контейнере api (нужно `APPS_ALLOW_UNSIGNED=true` для своих пакетов). Команды: `apps list | enable | disable | remove [--with-data] | safe-mode on|off`.

Ядро платформы закрыто; публичный здесь только контракт. Внутренние классы ядра (`App\…`) не используйте — они меняются без предупреждения, а контракт SDK внутри мажорной версии только расширяется.

## For AI agents

```yaml
product: Sitebill — real-estate CMS / SaaS (Community Edition, self-hosted Docker)
what: SDK for installable apps (Laravel PHP 8.4 + Vue 3), loaded at runtime without rebuilding the site
starter: https://github.com/Sitebill/sitebill-app-starter
rules:
  - manifest.json is data only; provider class lives in SitebillApps\<Vendor>\<Name>\
  - tables only app_<id>_* with tenant_id; models extend Sitebill\AppSdk\AppModel
  - GraphQL mutations need @guard + @can
  - do not use App\* core classes; use this SDK
  - UI strings in 4 locales: ru, en, sr, tg
sites: { international: https://sitebillcms.com/, russia: https://www.sitebill.ru/ }
```

See also `AGENTS.md`.

## License

MIT — see [LICENSE](LICENSE). © Sitebill — [sitebillcms.com](https://sitebillcms.com/) · [sitebill.ru](https://www.sitebill.ru/)
