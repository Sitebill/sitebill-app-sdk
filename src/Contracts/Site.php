<?php

namespace Sitebill\AppSdk\Contracts;

use Sitebill\AppSdk\Data\SiteInfo;

interface Site
{
    /** The current site, or null when there is no tenant context (console without a bound site). */
    public function current(): ?SiteInfo;
}
