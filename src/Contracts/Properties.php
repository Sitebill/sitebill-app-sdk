<?php

namespace Sitebill\AppSdk\Contracts;

use Sitebill\AppSdk\Data\PropertyData;

/** Read-only access to the site's listings. */
interface Properties
{
    public function find(int $id): ?PropertyData;

    /** @return list<PropertyData> newest published listings */
    public function latest(int $limit = 10): array;
}
