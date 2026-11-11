<?php

namespace Sitebill\AppSdk\Contracts;

/**
 * Current tenant (site) of the request. Implemented by the host and bound in the container.
 * null means "no tenant context" (console, queue worker without a bound tenant): no filtering.
 */
interface TenantContext
{
    public function currentTenantId(): ?int;
}
