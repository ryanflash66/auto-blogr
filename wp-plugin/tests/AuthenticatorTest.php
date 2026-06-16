<?php

declare(strict_types=1);

namespace AutoBlogr\Tests;

use AutoBlogr\Auth\Authenticator;
use AutoBlogr\Hmac\Signer;

final class AuthenticatorTest extends TestCase
{
    private Signer $signer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->signer = new Signer();
    }

    private function makeAuthenticator(int $now, int $tolerance = 300): Authenticator
    {
        return new Authenticator($this->signer, $tolerance, static fn (): int => $now);
    }

    public function testConstructorRejectsNonPositiveTolerance(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Authenticator($this->signer, 0);
    }

    public function testTimestampWithinWindowIsFresh(): void
    {
        $auth = $this->makeAuthenticator(1000, 300);

        $this->assertTrue($auth->timestampIsFresh('900'));
        $this->assertTrue($auth->timestampIsFresh('1300'));
    }

    public function testStaleTimestampIsNotFresh(): void
    {
        $auth = $this->makeAuthenticator(1000, 300);

        $this->assertFalse($auth->timestampIsFresh('699'));
    }

    public function testFutureTimestampBeyondWindowIsNotFresh(): void
    {
        $auth = $this->makeAuthenticator(1000, 300);

        $this->assertFalse($auth->timestampIsFresh('1301'));
    }

    public function testNonNumericTimestampIsNotFresh(): void
    {
        $auth = $this->makeAuthenticator(1000);

        $this->assertFalse($auth->timestampIsFresh('not-a-number'));
        $this->assertFalse($auth->timestampIsFresh(''));
    }

    public function testAuthenticateSucceedsForValidSignedRequest(): void
    {
        $auth = $this->makeAuthenticator(1000);
        $signature = $this->signer->sign('secret', '1000', 'POST', '/jobs', 'body');

        $result = $auth->authenticate('secret', '1000', 'POST', '/jobs', 'body', $signature);

        $this->assertTrue($result);
    }

    public function testAuthenticateFailsWithoutSecret(): void
    {
        $auth = $this->makeAuthenticator(1000);

        $result = $auth->authenticate('', '1000', 'POST', '/jobs', 'body', 'sig');

        $this->assertIsString($result);
        $this->assertStringContainsString('secret', $result);
    }

    public function testAuthenticateFailsWithMissingHeaders(): void
    {
        $auth = $this->makeAuthenticator(1000);

        $this->assertIsString($auth->authenticate('secret', '', 'POST', '/jobs', 'body', 'sig'));
        $this->assertIsString($auth->authenticate('secret', '1000', 'POST', '/jobs', 'body', ''));
    }

    public function testAuthenticateFailsForStaleTimestamp(): void
    {
        $auth = $this->makeAuthenticator(1000, 300);
        $signature = $this->signer->sign('secret', '500', 'POST', '/jobs', 'body');

        $result = $auth->authenticate('secret', '500', 'POST', '/jobs', 'body', $signature);

        $this->assertSame('Request timestamp is outside the allowed window.', $result);
    }

    public function testAuthenticateFailsForBadSignature(): void
    {
        $auth = $this->makeAuthenticator(1000);

        $result = $auth->authenticate('secret', '1000', 'POST', '/jobs', 'body', 'deadbeef');

        $this->assertSame('Signature verification failed.', $result);
    }
}
