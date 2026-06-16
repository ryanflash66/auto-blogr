<?php

declare(strict_types=1);

namespace AutoBlogr\Tests\Support;

use AutoBlogr\Jobs\JobStore;

/**
 * In-memory JobStore used by tests to observe saved job state.
 */
final class InMemoryJobStore implements JobStore
{
    /** @var array<string,array<string,mixed>> */
    public array $jobs = [];

    public function save(array $job): void
    {
        $this->jobs[$job['id']] = $job;
    }

    public function find(string $id): ?array
    {
        return $this->jobs[$id] ?? null;
    }
}
