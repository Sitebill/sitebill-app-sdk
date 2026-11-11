<?php

namespace Sitebill\AppSdk;

/**
 * What the host knows about an installed app: id, version and the unpacked package root.
 * Created by the host before the app's service provider is registered.
 */
final class AppDescriptor
{
    public function __construct(
        public readonly string $id,
        public readonly string $version,
        public readonly string $root,
    ) {
    }

    /** Every app table must start with this prefix: app_<id with "." and "-" replaced by "_">_ */
    public function tablePrefix(): string
    {
        return self::tablePrefixFor($this->id);
    }

    public static function tablePrefixFor(string $id): string
    {
        return 'app_'.str_replace(['.', '-'], '_', $id).'_';
    }

    /** Absolute path inside the package. */
    public function path(string $relative = ''): string
    {
        return rtrim($this->root.'/'.ltrim($relative, '/'), '/');
    }
}
