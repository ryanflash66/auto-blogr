<?php

declare(strict_types=1);

namespace AutoBlogr\Jobs;

/**
 * JobStore backed by the WordPress options API.
 *
 * Each job is stored under its own option key so reads and writes do not
 * contend on a single shared option row.
 */
final class OptionJobStore implements JobStore
{
    private const PREFIX = 'autoblogr_job_';

    public function save(array $job): void
    {
        if (!isset($job['id']) || !is_string($job['id']) || $job['id'] === '') {
            throw new \InvalidArgumentException('A job must have a non-empty string id.');
        }

        update_option(self::PREFIX . $job['id'], $job, false);
    }

    public function find(string $id): ?array
    {
        $job = get_option(self::PREFIX . $id, null);

        return is_array($job) ? $job : null;
    }
}
