# AGENTS.md — Sitebill App SDK

SDK for installable Sitebill apps (Laravel PHP 8.4 + Vue 3, loaded at runtime from a volume).
Product sites: https://sitebillcms.com/ (international), https://www.sitebill.ru/ (Russia/CIS).

- Layout: `src/` — PHP (`Sitebill\AppSdk\`): `Host` (Host API entry point), `Data/*` (DTOs), `AppServiceProvider`, `AppModel`, `AppDescriptor`,
  `Contracts/{AppHost,TenantContext,Site,AppSettings,Crm,Properties,Notifier}`, `Concerns/BelongsToTenant`, `Scopes/TenantScope`.
  `js/src/index.ts` — browser contract (`AppHost`, `defineAdminPages`, `AppManifest`).
- This package must not reference platform classes (`App\…`): the platform implements the contracts
  (`AppHost`, `TenantContext`) and binds them in its container.
- Contract rule: within a major version only add (methods, fields, props); removal/rename = new major
  (`sdk.php` / `sdk.web` in manifest.json and `apps.sdk_major` in the platform config).
- CLI: `js/bin/sitebill-app.mjs` (`check|pack|dev`), rules in `js/lib/check.mjs` mirror the platform installer (`App\Apps\AppInstaller`, `AppManifest`) — change both together.
- Status: preview 0.x, published on Packagist (`sitebill/app-sdk`) and npm (`@sitebill/app-sdk`) since v0.2.0. The platform loads `src/` from a git submodule.
- Public-facing text (README, package metadata) is bilingual EN/RU; code comments in English.
- Dev docs: https://github.com/rumantic/etownpro-developers-docs
