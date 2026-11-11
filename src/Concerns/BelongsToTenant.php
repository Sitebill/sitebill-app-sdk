<?php

namespace Sitebill\AppSdk\Concerns;

use Illuminate\Database\Eloquent\Model;
use Sitebill\AppSdk\Scopes\TenantScope;

/**
 * Tenant isolation for app models: reads see only the current tenant's rows,
 * new rows get tenant_id automatically. The table needs an indexed tenant_id column.
 */
trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function (Model $model) {
            if (! $model->tenant_id && ($tenantId = TenantScope::currentTenantId()) !== null) {
                $model->tenant_id = $tenantId;
            }
        });
    }
}
