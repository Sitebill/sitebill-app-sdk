<?php

namespace Sitebill\AppSdk;

use Sitebill\AppSdk\Contracts\AppSettings;
use Sitebill\AppSdk\Contracts\Crm;
use Sitebill\AppSdk\Contracts\Notifier;
use Sitebill\AppSdk\Contracts\Properties;
use Sitebill\AppSdk\Contracts\Site;

/**
 * Entry point to the platform for app code (Host API v1).
 * Implementations are provided by the platform; apps depend only on these contracts.
 *
 *   Host::site()->current()?->name
 *   Host::crm()->createLead(['name' => $name, 'phone' => $phone, 'source' => 'acme.callback'])
 *   Host::settings()->get('acme.callback', 'greeting', 'Hello')
 */
final class Host
{
    /** Contract version implemented by this SDK. */
    public const API_VERSION = '1.1';

    public static function site(): Site
    {
        return app(Site::class);
    }

    public static function settings(): AppSettings
    {
        return app(AppSettings::class);
    }

    public static function crm(): Crm
    {
        return app(Crm::class);
    }

    public static function properties(): Properties
    {
        return app(Properties::class);
    }

    public static function notifier(): Notifier
    {
        return app(Notifier::class);
    }
}
