<?php

namespace Sitebill\AppSdk\Data;

/** A lead (request) in the site's CRM pipeline, linked to a contact. */
final class LeadData
{
    public function __construct(
        public readonly int $id,
        public readonly int $contactId,
        public readonly ?string $name,
        public readonly ?string $phone,
        public readonly ?string $email,
        public readonly ?string $message,
        public readonly ?int $propertyId,
        public readonly string $source,
        public readonly string $createdAt,
    ) {
    }
}
