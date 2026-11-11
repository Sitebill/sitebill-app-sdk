<?php

namespace Sitebill\AppSdk\Contracts;

/**
 * Settings of an app for the current site. Stored by the platform per site (tenant) and app.
 * Use secret() / setSecret() for API keys and tokens: they are encrypted at rest.
 */
interface AppSettings
{
    public function get(string $appId, string $key, mixed $default = null): mixed;

    public function set(string $appId, string $key, mixed $value): void;

    public function forget(string $appId, string $key): void;

    /** @return array<string, mixed> plain (non-secret) settings */
    public function all(string $appId): array;

    public function secret(string $appId, string $key): ?string;

    public function setSecret(string $appId, string $key, ?string $value): void;
}
