<?php

namespace Sitebill\AppSdk\Contracts;

use Sitebill\AppSdk\Data\ContactData;
use Sitebill\AppSdk\Data\LeadData;

/**
 * The site's CRM. Contacts are deduplicated by phone/e-mail; a lead lands in the default pipeline
 * and notifies the site admins exactly like a lead from the built-in site form.
 */
interface Crm
{
    public function findOrCreateContact(?string $name, ?string $phone = null, ?string $email = null, string $source = 'app'): ContactData;

    public function findContact(int $id): ?ContactData;

    /**
     * @param  array{name: string, phone: string, email?: ?string, message?: ?string, property_id?: ?int, source?: string, notify?: bool}  $lead
     */
    public function createLead(array $lead): LeadData;
}
