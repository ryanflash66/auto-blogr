<?php

declare(strict_types=1);

namespace AutoBlogr\Auth;

use AutoBlogr\Hmac\Signer;

/**
 * Verifies the HMAC layer that sits on top of WordPress Application Passwords.
 *
 * WordPress core verifies the Application Password (HTTP Basic auth) and
 * resolves the current user before this runs. This class adds request
 * signing: it rejects requests with a missing, stale, future-dated, or
 * invalid signature, which defends against replay and tampering even when a
 * valid Application Password is presented.
 */
final class Authenticator
{
    public const SIGNATURE_HEADER = 'X-AutoBlogr-Signature';
    public const TIMESTAMP_HEADER = 'X-AutoBlogr-Timestamp';

    private Signer $signer;
    private int $toleranceSeconds;

    /** @var callable():int */
    private $clock;

    /**
     * @param callable():int|null $clock Returns the current unix time. Injectable for testing.
     */
    public function __construct(Signer $signer, int $toleranceSeconds = 300, ?callable $clock = null)
    {
        if ($toleranceSeconds <= 0) {
            throw new \InvalidArgumentException('Tolerance must be a positive number of seconds.');
        }

        $this->signer = $signer;
        $this->toleranceSeconds = $toleranceSeconds;
        $this->clock = $clock ?? static fn (): int => time();
    }

    /**
     * Check whether a timestamp is within the accepted window of now.
     */
    public function timestampIsFresh(string $timestamp): bool
    {
        if ($timestamp === '' || !ctype_digit($timestamp)) {
            return false;
        }

        $now = ($this->clock)();
        $delta = abs($now - (int) $timestamp);

        return $delta <= $this->toleranceSeconds;
    }

    /**
     * Authenticate a signed request.
     *
     * @return true|string True on success, or a human-readable reason on failure.
     */
    public function authenticate(
        string $secret,
        string $timestamp,
        string $method,
        string $path,
        string $body,
        string $providedSignature
    ): bool|string {
        if ($secret === '') {
            return 'No signing secret is configured for this user.';
        }

        if ($timestamp === '' || $providedSignature === '') {
            return 'Missing signature or timestamp header.';
        }

        if (!$this->timestampIsFresh($timestamp)) {
            return 'Request timestamp is outside the allowed window.';
        }

        if (!$this->signer->verify($secret, $timestamp, $method, $path, $body, $providedSignature)) {
            return 'Signature verification failed.';
        }

        return true;
    }
}
