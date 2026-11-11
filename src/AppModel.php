<?php

namespace Sitebill\AppSdk;

use Illuminate\Database\Eloquent\Model;
use Sitebill\AppSdk\Concerns\BelongsToTenant;

/**
 * Base model for app tables. Tenant isolation is always on: one package works the same on a
 * single-site Community install and on a multi-site platform.
 * The table name must start with the app prefix (see AppDescriptor::tablePrefix()).
 */
abstract class AppModel extends Model
{
    use BelongsToTenant;
}
