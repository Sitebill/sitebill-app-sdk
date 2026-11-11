// Browser contract of installable Sitebill apps, version 1 (preview).
// The site passes `host` as a prop to every admin page component of the app.
// Vue is shared with the site: the app bundle must NOT include its own copy of Vue
// (take it from globalThis.__SB_HOST__.vue or mark `vue` as external in your bundler).
import type { Component, Ref } from 'vue'

export interface AppHost {
  /** Current UI language: ru | en | sr | tg. */
  locale: Ref<string>
  /** Translation from the app's locales/<lang>.json (falls back to en, then ru, then the key). */
  t(key: string): string
  toast(title: string, color?: 'success' | 'error'): void
  formatDate(iso: string): string
  /** GraphQL of the site: the app's own fields and the published core fields. Returns `data`. */
  gql<T = any>(query: string, variables?: Record<string, unknown>): Promise<T>
  /** REST of the app: /api/v1/apps/<id>/<path>, with the admin's session and CSRF token. */
  rest<T = any>(path: string, opts?: { method?: string, body?: unknown }): Promise<T>
  /** Site UI components available to apps (Nuxt UI). */
  components: {
    UButton: Component
    UInput: Component
    UTextarea: Component
    UBadge: Component
    UIcon: Component
    UModal: Component
    UCard: Component
  }
  /** Signed-in site user (read-only) or null for a guest. */
  readonly user: { id: string, name: string } | null
}

/** Props every admin page component receives. */
export interface AppPageProps {
  host: AppHost
}

/**
 * Admin pages of the app, keyed by path relative to /admin/x/<app-id>/ ('' is the app's home page).
 * The keys must match manifest.json → admin.pages.
 */
export type AppAdminPages = Record<string, Component>

/** Typed helper for the `pages` export of web/admin.mjs. */
export function defineAdminPages<T extends AppAdminPages>(pages: T): T {
  return pages
}

/**
 * Widget slots of the site and the admin panel (contract 1.1). Widgets render in the browser only.
 *  - site:  'property.detail' (context: { propertyId }), 'home.sections', 'global' (over every page)
 *  - admin: 'admin.dashboard'
 * Declare them in manifest.json: "site": { "widgets": { "property.detail": "CallbackButton" } }
 * and export the components from web/site.mjs (or web/admin.mjs for admin widgets): `export const widgets = {...}`.
 */
export type SiteWidgetSlot = 'property.detail' | 'home.sections' | 'global'
export type AdminWidgetSlot = 'admin.dashboard'

/** Props every widget component receives. */
export interface AppWidgetProps<C extends Record<string, unknown> = Record<string, unknown>> {
  host: AppHost
  /** Data of the place, e.g. { propertyId } for 'property.detail'. */
  context: C
}

export type AppWidgets = Record<string, Component>

/** Typed helper for the `widgets` export of web/site.mjs / web/admin.mjs. */
export function defineWidgets<T extends AppWidgets>(widgets: T): T {
  return widgets
}

export interface AppManifest {
  id: string
  name: string | Record<string, string>
  version: string
  vendor?: { name: string, url?: string }
  description?: string | Record<string, string>
  sdk: { php?: '1', web?: '1' }
  requires?: { host?: string, php?: string, apps?: Record<string, string> }
  provider?: string
  permissions?: string[]
  admin?: {
    menu?: { label: string | Record<string, string>, icon?: string, path?: string }[]
    pages?: string[]
    widgets?: Partial<Record<AdminWidgetSlot, string>>
  }
  site?: { widgets?: Partial<Record<SiteWidgetSlot, string>> }
  web?: { admin?: string, site?: string }
}
