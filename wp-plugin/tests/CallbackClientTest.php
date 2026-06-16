<?php

declare(strict_types=1);

namespace AutoBlogr\Tests;

use AutoBlogr\Hmac\Signer;
use AutoBlogr\Http\CallbackClient;
use Brain\Monkey\Functions;

final class CallbackClientTest extends TestCase
{
    private Signer $signer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->signer = new Signer();

        Functions\when('wp_json_encode')->alias(static fn ($data): string => (string) json_encode($data));
        Functions\when('wp_parse_url')->alias(static fn ($url, $component) => parse_url($url, $component));
    }

    public function testBuildRequestProducesAVerifiableSignature(): void
    {
        $client = new CallbackClient($this->signer, static fn (): int => 1700000000);

        $request = $client->buildRequest('https://example.test/hook', 'secret', ['ok' => true]);

        $this->assertSame('{"ok":true}', $request['body']);
        $this->assertSame('1700000000', $request['headers'][CallbackClient::TIMESTAMP_HEADER]);

        $valid = $this->signer->verify(
            'secret',
            '1700000000',
            'POST',
            '/hook',
            $request['body'],
            $request['headers'][CallbackClient::SIGNATURE_HEADER]
        );
        $this->assertTrue($valid);
    }

    public function testSendReturnsTrueOnSuccessfulResponse(): void
    {
        $client = new CallbackClient($this->signer, static fn (): int => 1700000000);

        Functions\expect('wp_remote_post')
            ->once()
            ->with('https://example.test/hook', \Mockery::on(static function (array $args): bool {
                return $args['body'] === '{"ok":true}'
                    && isset($args['headers'][CallbackClient::SIGNATURE_HEADER]);
            }))
            ->andReturn(['response' => ['code' => 200]]);
        Functions\when('is_wp_error')->justReturn(false);
        Functions\when('wp_remote_retrieve_response_code')->justReturn(200);

        $this->assertTrue($client->send('https://example.test/hook', 'secret', ['ok' => true]));
    }

    public function testSendReturnsFalseOnWpError(): void
    {
        $client = new CallbackClient($this->signer, static fn (): int => 1700000000);

        Functions\when('wp_remote_post')->justReturn(['error']);
        Functions\when('is_wp_error')->justReturn(true);

        $this->assertFalse($client->send('https://example.test/hook', 'secret', ['ok' => true]));
    }

    public function testSendReturnsFalseOnNon2xxResponse(): void
    {
        $client = new CallbackClient($this->signer, static fn (): int => 1700000000);

        Functions\when('wp_remote_post')->justReturn(['response' => ['code' => 500]]);
        Functions\when('is_wp_error')->justReturn(false);
        Functions\when('wp_remote_retrieve_response_code')->justReturn(500);

        $this->assertFalse($client->send('https://example.test/hook', 'secret', ['ok' => true]));
    }
}
