<?php

namespace Sitebill\AppSdk\Data;

/** A CRM contact (person or company) of the site. */
final class ContactData
{
    /**
     * @param  list<string>  $phones
     * @param  list<string>  $emails
     */
    public function __construct(
        public readonly int $id,
        public readonly ?string $name,
        public readonly array $phones,
        public readonly array $emails,
        public readonly ?string $source,
    ) {
    }
}
