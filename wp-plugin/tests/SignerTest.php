<?php

declare(strict_types=1);

namespace AutoBlogr\Tests;

use AutoBlogr\Hmac\Signer;

final class SignerTest extends TestCase
{
    private Signer $signer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->signer = new Signer();
    }

    public function testCanonicalStringJoinsPartsAndUppercasesMethod(): void
    {
        $canonical = $this->signer->canonicalString('123', 'post', '/autoblogr/v1/jobs', '{"a":1}');

        $this->assertSame("123\nPOST\n/autoblogr/v1/jobs\n{\"a\":1}", $canonical);
    }

    public function testSignIsDeterministicAndMatchesKnownHmac(): void
    {
        $signature = $this->signer->sign('secret', '123', 'POST', '/jobs', 'body');

        $expected = hash_hmac('sha256', "123\nPOST\n/jobs\nbody", 'secret');
        $this->assertSame($expected, $signature);
        $this->assertSame($signature, $this->signer->sign('secret', '123', 'POST', '/jobs', 'body'));
    }

    public function testSignRejectsEmptySecret(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->signer->sign('', '123', 'POST', '/jobs', 'body');
    }

    public function testVerifyAcceptsAValidSignature(): void
    {
        $signature = $this->signer->sign('secret', '123', 'POST', '/jobs', 'body');

        $this->assertTrue($this->signer->verify('secret', '123', 'POST', '/jobs', 'body', $signature));
    }

    public function testVerifyRejectsTamperedBody(): void
    {
        $signature = $this->signer->sign('secret', '123', 'POST', '/jobs', 'body');

        $this->assertFalse($this->signer->verify('secret', '123', 'POST', '/jobs', 'tampered', $signature));
    }

    public function testVerifyRejectsWrongSecret(): void
    {
        $signature = $this->signer->sign('secret', '123', 'POST', '/jobs', 'body');

        $this->assertFalse($this->signer->verify('other', '123', 'POST', '/jobs', 'body', $signature));
    }

    public function testVerifyRejectsEmptySignature(): void
    {
        $this->assertFalse($this->signer->verify('secret', '123', 'POST', '/jobs', 'body', ''));
    }
}
