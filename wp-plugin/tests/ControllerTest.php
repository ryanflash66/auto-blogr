<?php

declare(strict_types=1);

namespace AutoBlogr\Tests;

use AutoBlogr\Auth\Authenticator;
use AutoBlogr\Hmac\Signer;
use AutoBlogr\Http\CallbackClient;
use AutoBlogr\Jobs\PostProcessor;
use AutoBlogr\Rest\Controller;
use AutoBlogr\Tests\Support\InMemoryJobStore;
use Brain\Monkey\Functions;

final class ControllerTest extends TestCase
{
    private Signer $signer;
    private InMemoryJobStore $store;
    private Controller $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->signer = new Signer();
        $this->store = new InMemoryJobStore();

        $authenticator = new Authenticator($this->signer, 300, static fn (): int => 1700000000);
        $callback = new CallbackClient($this->signer, static fn (): int => 1700000000);
        $processor = new PostProcessor(
            $this->store,
            $callback,
            static fn (): string => 'job-123',
            static fn (): int => 1700000000
        );

        $this->controller = new Controller($authenticator, $processor, $this->store);
    }

    public function testRegisterAddsBothRoutes(): void
    {
        Functions\expect('register_rest_route')
            ->twice()
            ->with(Controller::NAMESPACE, \Mockery::type('string'), \Mockery::type('array'));

        $this->controller->register();
    }

    public function testSecretForCurrentUserReadsUserMeta(): void
    {
        Functions\when('get_current_user_id')->justReturn(7);
        Functions\expect('get_user_meta')
            ->once()
            ->with(7, Controller::SECRET_META_KEY, true)
            ->andReturn('the-secret');

        $this->assertSame('the-secret', $this->controller->secret_for_current_user());
    }

    public function testSecretForCurrentUserReturnsEmptyWhenLoggedOut(): void
    {
        Functions\when('get_current_user_id')->justReturn(0);

        $this->assertSame('', $this->controller->secret_for_current_user());
    }

    public function testCheckPermissionRejectsLoggedOutUser(): void
    {
        Functions\when('get_current_user_id')->justReturn(0);

        $request = new \WP_REST_Request('POST', '/autoblogr/v1/jobs');
        $result = $this->controller->check_permission($request);

        $this->assertInstanceOf(\WP_Error::class, $result);
        $this->assertSame('autoblogr_unauthenticated', $result->get_error_code());
    }

    public function testCheckPermissionRejectsInvalidSignature(): void
    {
        Functions\when('get_current_user_id')->justReturn(7);
        Functions\when('get_user_meta')->justReturn('the-secret');

        $request = new \WP_REST_Request('POST', '/autoblogr/v1/jobs', [
            Authenticator::TIMESTAMP_HEADER => '1700000000',
            Authenticator::SIGNATURE_HEADER => 'wrong',
        ], '{}');

        $result = $this->controller->check_permission($request);

        $this->assertInstanceOf(\WP_Error::class, $result);
        $this->assertSame('autoblogr_bad_signature', $result->get_error_code());
    }

    public function testCheckPermissionAcceptsValidSignedRequest(): void
    {
        Functions\when('get_current_user_id')->justReturn(7);
        Functions\when('get_user_meta')->justReturn('the-secret');

        $body = '{}';
        $route = '/autoblogr/v1/jobs';
        $signature = $this->signer->sign('the-secret', '1700000000', 'POST', $route, $body);

        $request = new \WP_REST_Request('POST', $route, [
            Authenticator::TIMESTAMP_HEADER => '1700000000',
            Authenticator::SIGNATURE_HEADER => $signature,
        ], $body);

        $this->assertTrue($this->controller->check_permission($request));
    }

    public function testSubmitJobReturns202OnSuccess(): void
    {
        Functions\expect('wp_schedule_single_event')->once();

        $body = json_encode([
            'title' => 'Hello',
            'content' => 'world',
            'callback_url' => 'https://example.test/hook',
        ]);
        $request = new \WP_REST_Request('POST', '/autoblogr/v1/jobs', [], (string) $body);

        $response = $this->controller->submit_job($request);

        $this->assertSame(202, $response->get_status());
        $this->assertSame(['id' => 'job-123', 'status' => 'queued'], $response->get_data());
    }

    public function testSubmitJobReturns422OnValidationError(): void
    {
        $request = new \WP_REST_Request('POST', '/autoblogr/v1/jobs', [], '{"content":"no title"}');

        $response = $this->controller->submit_job($request);

        $this->assertSame(422, $response->get_status());
        $this->assertArrayHasKey('error', $response->get_data());
    }

    public function testGetJobReturnsStoredJob(): void
    {
        $this->store->save(['id' => 'job-123', 'status' => 'completed']);

        $request = new \WP_REST_Request('GET', '/autoblogr/v1/jobs/job-123', [], '', ['id' => 'job-123']);
        $response = $this->controller->get_job($request);

        $this->assertSame(200, $response->get_status());
        $this->assertSame('completed', $response->get_data()['status']);
    }

    public function testGetJobReturns404ForUnknownJob(): void
    {
        $request = new \WP_REST_Request('GET', '/autoblogr/v1/jobs/missing', [], '', ['id' => 'missing']);
        $response = $this->controller->get_job($request);

        $this->assertSame(404, $response->get_status());
    }
}
