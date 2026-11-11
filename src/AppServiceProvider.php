<?php

namespace Sitebill\AppSdk;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Sitebill\AppSdk\Contracts\AppHost;
use Throwable;

/**
 * Base service provider of an app (the class named in manifest.json "provider").
 *
 * The host wires resources by convention: autoloading of api/src, migrations from
 * api/database/migrations, GraphQL from api/graphql/schema.graphql, REST from api/routes/api.php
 * (under /api/v1/apps/<id>), translations from api/lang. Override registerApp()/bootApp()
 * for everything else. Exceptions thrown there mark the app as broken; the site keeps working.
 */
abstract class AppServiceProvider extends ServiceProvider
{
    /** Set by the host before register(). */
    public AppDescriptor $descriptor;

    /** Set by the host before register(). */
    public AppHost $host;

    final public function register(): void
    {
        try {
            $this->registerApp();
        } catch (Throwable $e) {
            $this->host->markBroken($this->descriptor->id, $e);
        }
    }

    final public function boot(): void
    {
        if ($this->host->isBroken($this->descriptor->id)) {
            return;
        }
        try {
            $this->bootApp();
        } catch (Throwable $e) {
            $this->host->markBroken($this->descriptor->id, $e);
        }
    }

    protected function registerApp(): void
    {
    }

    protected function bootApp(): void
    {
    }

    protected function appId(): string
    {
        return $this->descriptor->id;
    }

    /** Absolute path inside the app package. */
    protected function path(string $relative = ''): string
    {
        return $this->descriptor->path($relative);
    }

    /** Table name with the mandatory app prefix. */
    protected function table(string $name): string
    {
        return $this->descriptor->tablePrefix().$name;
    }

    protected function policy(string $model, string $policy): void
    {
        Gate::policy($model, $policy);
    }
}
