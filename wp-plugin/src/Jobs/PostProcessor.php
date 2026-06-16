<?php

declare(strict_types=1);

namespace AutoBlogr\Jobs;

use AutoBlogr\Http\CallbackClient;

/**
 * Accepts post-processing jobs, runs them out of the request cycle, and fires
 * a signed completion callback when each job finishes.
 *
 * The HTTP request that submits a job returns immediately with a job id. The
 * actual work runs later on the scheduled hook (WordPress deferred execution
 * via wp_schedule_single_event), which is what makes the processing
 * asynchronous from the caller's perspective.
 */
final class PostProcessor
{
    public const HOOK = 'autoblogr_run_job';

    private JobStore $store;
    private CallbackClient $callback;

    /** @var callable():string */
    private $idGenerator;

    /** @var callable():int */
    private $clock;

    /**
     * @param callable():string|null $idGenerator Injectable for deterministic tests.
     * @param callable():int|null    $clock       Injectable for deterministic tests.
     */
    public function __construct(
        JobStore $store,
        CallbackClient $callback,
        ?callable $idGenerator = null,
        ?callable $clock = null
    ) {
        $this->store = $store;
        $this->callback = $callback;
        $this->idGenerator = $idGenerator ?? static fn (): string => wp_generate_uuid4();
        $this->clock = $clock ?? static fn (): int => time();
    }

    /**
     * Validate and queue a job, then schedule it for asynchronous execution.
     *
     * @param array<string,mixed> $request
     * @return array{id:string,status:string}
     */
    public function enqueue(array $request): array
    {
        $title = isset($request['title']) && is_string($request['title']) ? trim($request['title']) : '';
        $content = isset($request['content']) && is_string($request['content']) ? $request['content'] : '';
        $callbackUrl = isset($request['callback_url']) && is_string($request['callback_url'])
            ? trim($request['callback_url'])
            : '';

        if ($title === '') {
            throw new \InvalidArgumentException('A job requires a non-empty title.');
        }

        if ($callbackUrl === '') {
            throw new \InvalidArgumentException('A job requires a callback_url.');
        }

        $id = ($this->idGenerator)();

        $job = [
            'id' => $id,
            'status' => 'queued',
            'created_at' => ($this->clock)(),
            'callback_url' => $callbackUrl,
            'callback_secret' => isset($request['callback_secret']) && is_string($request['callback_secret'])
                ? $request['callback_secret']
                : '',
            'payload' => [
                'title' => $title,
                'content' => $content,
            ],
        ];

        $this->store->save($job);
        wp_schedule_single_event(($this->clock)(), self::HOOK, [$id]);

        return ['id' => $id, 'status' => 'queued'];
    }

    /**
     * The real processing step: derive a slug, word count, and excerpt.
     *
     * @param array{title:string,content:string} $payload
     * @return array<string,mixed>
     */
    public function transform(array $payload): array
    {
        $title = $payload['title'] ?? '';
        $content = $payload['content'] ?? '';

        $plain = trim(preg_replace('/\s+/', ' ', strip_tags($content)) ?? '');
        $words = $plain === '' ? [] : explode(' ', $plain);
        $wordCount = count($words);

        $excerpt = implode(' ', array_slice($words, 0, 40));
        if ($wordCount > 40) {
            $excerpt .= '...';
        }

        $slug = $this->slugify($title);

        return [
            'slug' => $slug,
            'word_count' => $wordCount,
            'excerpt' => $excerpt,
        ];
    }

    /**
     * Execute a queued job and deliver its completion callback.
     */
    public function run(string $jobId): void
    {
        $job = $this->store->find($jobId);
        if ($job === null) {
            return;
        }

        $result = $this->transform($job['payload']);

        $job['status'] = 'completed';
        $job['completed_at'] = ($this->clock)();
        $job['result'] = $result;
        $this->store->save($job);

        if ($job['callback_url'] !== '') {
            $this->callback->send(
                $job['callback_url'],
                (string) ($job['callback_secret'] ?? ''),
                [
                    'job_id' => $jobId,
                    'status' => 'completed',
                    'result' => $result,
                ]
            );
        }
    }

    private function slugify(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';

        return trim($value, '-');
    }
}
