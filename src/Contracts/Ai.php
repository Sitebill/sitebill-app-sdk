<?php

namespace Sitebill\AppSdk\Contracts;

use Sitebill\AppSdk\Exceptions\AiException;

/**
 * The site's AI gateway: the owner's own provider key or the platform model, per-site limits and the usage log
 * stay on the platform side. The app builds the prompt; the gateway calls the model.
 *
 *   if (Host::ai()->status()['available']) {
 *       $text = Host::ai()->complete('acme.writer', 'draft', [
 *           ['role' => 'system', 'content' => 'You are a copywriter.'],
 *           ['role' => 'user', 'content' => $brief],
 *       ], ['max_tokens' => 800]);
 *   }
 */
interface Ai
{
    /** @return array{available: bool, source: ?string} source: "own_key" (the site's key) | "platform" | null */
    public function status(): array;

    /**
     * @param  list<array{role: string, content: string}>  $messages  roles: system | user | assistant
     * @param  array{max_tokens?: int, temperature?: float, instruction?: string}  $options  instruction goes to the usage log
     *
     * @throws AiException with a message that is safe to show to the user
     */
    public function complete(string $appId, string $feature, array $messages, array $options = []): string;
}
