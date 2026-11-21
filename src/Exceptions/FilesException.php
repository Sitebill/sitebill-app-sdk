<?php

namespace Sitebill\AppSdk\Exceptions;

use GraphQL\Error\ClientAware;

/** Upload rejected (not an image, too large). The message is safe to show to the user as is. */
class FilesException extends \RuntimeException implements ClientAware
{
    public function isClientSafe(): bool
    {
        return true;
    }
}
