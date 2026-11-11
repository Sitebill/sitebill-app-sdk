<?php

namespace Sitebill\AppSdk\Contracts;

use Throwable;

/**
 * The platform side that loads apps. Implemented by the host, not by apps.
 * An exception in one app marks it as broken instead of taking the whole site down.
 */
interface AppHost
{
    public function markBroken(string $appId, Throwable|string $reason): void;

    public function isBroken(string $appId): bool;
}
