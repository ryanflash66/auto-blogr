<?php

declare(strict_types=1);

namespace AutoBlogr\Hmac;

/**
 * Computes and verifies HMAC-SHA256 signatures over a canonical request string.
 *
 * The canonical string binds the signature to the timestamp, HTTP method,
 * request path, and the raw request body so that none of those parts can be
 * altered in transit without invalidating the signature.
 */
final class Signer
{
    public const ALGORITHM = 'sha256';

    /**
     * Build the canonical string that gets signed.
     *
     * Format: "<timestamp>\n<UPPERCASE METHOD>\n<path>\n<body>"
     */
    public function canonicalString(string $timestamp, string $method, string $path, string $body): string
    {
        return implode("\n", [
            $timestamp,
            strtoupper($method),
            $path,
            $body,
        ]);
    }

    /**
     * Compute the hex-encoded HMAC-SHA256 signature for a request.
     */
    public function sign(string $secret, string $timestamp, string $method, string $path, string $body): string
    {
        if ($secret === '') {
            throw new \InvalidArgumentException('Signing secret must not be empty.');
        }

        $canonical = $this->canonicalString($timestamp, $method, $path, $body);

        return hash_hmac(self::ALGORITHM, $canonical, $secret);
    }

    /**
     * Verify a provided signature using a constant-time comparison.
     */
    public function verify(
        string $secret,
        string $timestamp,
        string $method,
        string $path,
        string $body,
        string $providedSignature
    ): bool {
        if ($providedSignature === '') {
            return false;
        }

        $expected = $this->sign($secret, $timestamp, $method, $path, $body);

        return hash_equals($expected, $providedSignature);
    }
}
