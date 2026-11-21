<?php

namespace Sitebill\AppSdk\Contracts;

/**
 * Image uploads of an app into the site's public storage (local disk or the tenant's own S3).
 * Files live under `apps/<app id>/` — an app can read and delete only its own files.
 */
interface Files
{
    /**
     * Store an uploaded image (jpg, png, webp, gif; up to 5 MB). Anything else is rejected.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @return array{path: string, url: string}  `path` is stored in the app's table, `url` is public
     *
     * @throws \Sitebill\AppSdk\Exceptions\HostException  not an image or too large
     */
    public function storeImage(string $appId, $file): array;

    /** Public URL of a path returned by storeImage() (null for a foreign or empty path). */
    public function url(string $appId, ?string $path): ?string;

    /** Delete a file by path; paths outside `apps/<app id>/` are ignored. */
    public function delete(string $appId, ?string $path): void;
}
