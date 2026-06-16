<?php

declare(strict_types=1);

namespace AutoBlogr\Jobs;

/**
 * Persistence boundary for asynchronous jobs.
 */
interface JobStore
{
    /**
     * @param array<string,mixed> $job
     */
    public function save(array $job): void;

    /**
     * @return array<string,mixed>|null
     */
    public function find(string $id): ?array;
}
