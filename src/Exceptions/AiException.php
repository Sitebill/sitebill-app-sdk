<?php

namespace Sitebill\AppSdk\Exceptions;

use GraphQL\Error\ClientAware;

/** AI gateway error. The message is safe to show to the user as is (no keys, no request bodies). */
class AiException extends \RuntimeException implements ClientAware
{
    /** @param string $kind unavailable | blocked | error */
    public function __construct(string $message, public readonly string $kind = 'error')
    {
        parent::__construct($message);
    }

    public function isClientSafe(): bool
    {
        return true;
    }

    public function getCategory(): string
    {
        return 'ai';
    }
}
