<?php

namespace Sitebill\AppSdk\Contracts;

use Sitebill\AppSdk\Data\SiteInfo;

interface Site
{
    /** The current site, or null when there is no tenant context (console without a bound site). */
    public function current(): ?SiteInfo;

    /**
     * Run $callback in the context of a site (tenant): for console commands and queue jobs, where the
     * platform does not bind a site. The previous context is restored afterwards.
     *
     * @template T
     * @param  callable(): T  $callback
     * @return T
     */
    public function runAs(int $tenantId, callable $callback): mixed;
}
