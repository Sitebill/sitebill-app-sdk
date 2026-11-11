<?php

namespace Sitebill\AppSdk\Data;

/** The site (tenant) the current request or job belongs to. */
final class SiteInfo
{
    /** @param list<string> $locales */
    public function __construct(
        public readonly int $tenantId,
        public readonly string $name,
        public readonly string $url,
        public readonly string $locale,
        public readonly array $locales,
    ) {
    }
}
