<?php

namespace Sitebill\AppSdk\Contracts;

/**
 * Notifications through the platform's channels (bell, e-mail, Telegram, Max) respecting
 * each admin's notification preferences (event type "app.message").
 */
interface Notifier
{
    public function notifyAdmins(string $appId, string $title, string $body = '', ?string $url = null): void;

    /**
     * Notify particular users of the current site (e.g. the assignee of a task) through their own channels.
     * Ids of users who do not belong to the current site are ignored.
     *
     * @param  list<int>  $userIds
     */
    public function notifyUsers(string $appId, array $userIds, string $title, string $body = '', ?string $url = null): void;
}
