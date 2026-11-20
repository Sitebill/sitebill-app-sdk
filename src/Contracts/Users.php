<?php

namespace Sitebill\AppSdk\Contracts;

use Illuminate\Contracts\Auth\Authenticatable;

/** Users of the current site (tenant). */
interface Users
{
    /** The user is an administrator of the current site. Users of other sites and platform staff are not. */
    public function isAdmin(?Authenticatable $user): bool;

    /**
     * @param  list<int>  $ids
     * @return array<int, string> id => display name (only users of the current site)
     */
    public function names(array $ids): array;
}
