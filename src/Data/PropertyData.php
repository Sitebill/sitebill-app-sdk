<?php

namespace Sitebill\AppSdk\Data;

/** A real-estate listing of the site (read-only view for apps). */
final class PropertyData
{
    public function __construct(
        public readonly int $id,
        public readonly string $title,
        public readonly ?string $url,
        public readonly ?float $price,
        public readonly ?string $currency,
        /** sale | rent | daily_rent … as stored by the platform */
        public readonly ?string $dealType,
        public readonly ?string $type,
        public readonly ?string $city,
        public readonly bool $published,
        public readonly ?string $createdAt,
    ) {
    }
}
