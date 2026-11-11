<?php

namespace Sitebill\AppSdk\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Sitebill\AppSdk\Contracts\TenantContext;

/** Limits every query to the current tenant's rows (tenant_id column). */
final class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = self::currentTenantId();
        if ($tenantId !== null) {
            $builder->where($model->getTable().'.tenant_id', $tenantId);
        }
    }

    public static function currentTenantId(): ?int
    {
        return app()->bound(TenantContext::class) ? app(TenantContext::class)->currentTenantId() : null;
    }
}
