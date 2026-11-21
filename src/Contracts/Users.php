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

    /**
     * Search users of the current site by name or e-mail (empty query — the first users by name).
     * Needed by apps that assign people to things (project members, assignees).
     *
     * @return list<array{id: int, name: string, email: string}>
     */
    public function search(string $query = '', int $limit = 20): array;
}
