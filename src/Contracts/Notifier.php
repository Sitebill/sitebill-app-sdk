<?php

namespace Sitebill\AppSdk\Contracts;

/**
 * Notifications through the platform's channels (bell, e-mail, Telegram, Max) respecting
 * each admin's notification preferences (event type "app.message").
 */
interface Notifier
{
    public function notifyAdmins(string $appId, string $title, string $body = '', ?string $url = null): void;
}
