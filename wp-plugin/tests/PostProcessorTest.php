<?php

declare(strict_types=1);

namespace AutoBlogr\Tests;

use AutoBlogr\Hmac\Signer;
use AutoBlogr\Http\CallbackClient;
use AutoBlogr\Jobs\PostProcessor;
use AutoBlogr\Tests\Support\InMemoryJobStore;
use Brain\Monkey\Functions;

final class PostProcessorTest extends TestCase
{
    private InMemoryJobStore $store;
    private CallbackClient $callback;

    protected function setUp(): void
    {
        parent::setUp();
        $this->store = new InMemoryJobStore();
        $this->callback = new CallbackClient(new Signer(), static fn (): int => 1700000000);

        Functions\when('wp_json_encode')->alias(static fn ($data): string => (string) json_encode($data));
        Functions\when('wp_parse_url')->alias(static fn ($url, $component) => parse_url($url, $component));
    }

    private function makeProcessor(): PostProcessor
    {
        return new PostProcessor(
            $this->store,
            $this->callback,
            static fn (): string => 'job-123',
            static fn (): int => 1700000000
        );
    }

    public function testEnqueueStoresJobAndSchedulesEvent(): void
    {
        Functions\expect('wp_schedule_single_event')
            ->once()
            ->with(1700000000, PostProcessor::HOOK, ['job-123']);

        $result = $this->makeProcessor()->enqueue([
            'title' => 'Hello World',
            'content' => 'Some content',
            'callback_url' => 'https://example.test/hook',
        ]);

        $this->assertSame(['id' => 'job-123', 'status' => 'queued'], $result);
        $this->assertSame('queued', $this->store->jobs['job-123']['status']);
        $this->assertSame('https://example.test/hook', $this->store->jobs['job-123']['callback_url']);
    }

    public function testEnqueueRejectsMissingTitle(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->makeProcessor()->enqueue(['callback_url' => 'https://example.test/hook']);
    }

    public function testEnqueueRejectsMissingCallbackUrl(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->makeProcessor()->enqueue(['title' => 'Hello']);
    }

    public function testTransformComputesSlugWordCountAndExcerpt(): void
    {
        $result = $this->makeProcessor()->transform([
            'title' => 'My Great Post!',
            'content' => '<p>Hello world this is content.</p>',
        ]);

        $this->assertSame('my-great-post', $result['slug']);
        $this->assertSame(5, $result['word_count']);
        $this->assertSame('Hello world this is content.', $result['excerpt']);
    }

    public function testTransformTruncatesLongExcerpt(): void
    {
        $content = implode(' ', array_fill(0, 50, 'word'));

        $result = $this->makeProcessor()->transform(['title' => 'T', 'content' => $content]);

        $this->assertSame(50, $result['word_count']);
        $this->assertStringEndsWith('...', $result['excerpt']);
        $this->assertSame(40, substr_count($result['excerpt'], 'word'));
    }

    public function testRunProcessesJobAndSendsCallback(): void
    {
        $this->store->save([
            'id' => 'job-123',
            'status' => 'queued',
            'callback_url' => 'https://example.test/hook',
            'callback_secret' => 'secret',
            'payload' => ['title' => 'Hello World', 'content' => 'a b c'],
        ]);

        Functions\expect('wp_remote_post')->once()->andReturn(['response' => ['code' => 200]]);
        Functions\when('is_wp_error')->justReturn(false);
        Functions\when('wp_remote_retrieve_response_code')->justReturn(200);

        $this->makeProcessor()->run('job-123');

        $this->assertSame('completed', $this->store->jobs['job-123']['status']);
        $this->assertSame(3, $this->store->jobs['job-123']['result']['word_count']);
        $this->assertSame('hello-world', $this->store->jobs['job-123']['result']['slug']);
    }

    public function testRunIsANoOpForUnknownJob(): void
    {
        Functions\expect('wp_remote_post')->never();

        $this->makeProcessor()->run('does-not-exist');

        $this->assertSame([], $this->store->jobs);
    }

    public function testRunSkipsCallbackWhenUrlIsEmpty(): void
    {
        $this->store->save([
            'id' => 'job-123',
            'status' => 'queued',
            'callback_url' => '',
            'callback_secret' => '',
            'payload' => ['title' => 'Hello', 'content' => 'a b'],
        ]);

        Functions\expect('wp_remote_post')->never();

        $this->makeProcessor()->run('job-123');

        $this->assertSame('completed', $this->store->jobs['job-123']['status']);
    }
}
