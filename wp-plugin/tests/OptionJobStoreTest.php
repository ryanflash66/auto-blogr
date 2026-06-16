<?php

declare(strict_types=1);

namespace AutoBlogr\Tests;

use AutoBlogr\Jobs\OptionJobStore;
use Brain\Monkey\Functions;

final class OptionJobStoreTest extends TestCase
{
    public function testSaveWritesToOptions(): void
    {
        $store = new OptionJobStore();

        Functions\expect('update_option')
            ->once()
            ->with('autoblogr_job_abc', \Mockery::type('array'), false);

        $store->save(['id' => 'abc', 'status' => 'queued']);
    }

    public function testSaveRejectsJobWithoutId(): void
    {
        $store = new OptionJobStore();

        $this->expectException(\InvalidArgumentException::class);
        $store->save(['status' => 'queued']);
    }

    public function testFindReturnsStoredJob(): void
    {
        $store = new OptionJobStore();

        Functions\expect('get_option')
            ->once()
            ->with('autoblogr_job_abc', null)
            ->andReturn(['id' => 'abc', 'status' => 'completed']);

        $this->assertSame('completed', $store->find('abc')['status']);
    }

    public function testFindReturnsNullWhenMissing(): void
    {
        $store = new OptionJobStore();

        Functions\when('get_option')->justReturn(null);

        $this->assertNull($store->find('missing'));
    }
}
