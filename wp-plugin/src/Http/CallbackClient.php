<?php

declare(strict_types=1);

namespace AutoBlogr\Http;

use AutoBlogr\Hmac\Signer;

/**
 * Delivers a signed completion callback to a caller-supplied URL.
 *
 * The callback body is signed with the same HMAC scheme used for inbound
 * requests, so the receiver can verify the result genuinely came from this
 * plugin and was not tampered with.
 */
final class CallbackClient
{
    public const SIGNATURE_HEADER = 'X-AutoBlogr-Signature';
    public const TIMESTAMP_HEADER = 'X-AutoBlogr-Timestamp';

    private Signer $signer;

    /** @var callable():int */
    private $clock;

    /**
     * @param callable():int|null $clock Returns the current unix time. Injectable for testing.
     */
    public function __construct(Signer $signer, ?callable $clock = null)
    {
        $this->signer = $signer;
        $this->clock = $clock ?? static fn (): int => time();
    }

    /**
     * Build the JSON body and signed headers for a callback delivery.
     *
     * Exposed separately from send() so the signing behavior is testable
     * without performing network I/O.
     *
     * @param array<string,mixed> $result
     * @return array{body:string,headers:array<string,string>}
     */
    public function buildRequest(string $url, string $secret, array $result): array
    {
        $body = (string) wp_json_encode($result);
        $timestamp = (string) ($this->clock)();
        $path = (string) (wp_parse_url($url, PHP_URL_PATH) ?: '/');
        $signature = $this->signer->sign($secret, $timestamp, 'POST', $path, $body);

        return [
            'body' => $body,
            'headers' => [
                'Content-Type' => 'application/json',
                self::TIMESTAMP_HEADER => $timestamp,
                self::SIGNATURE_HEADER => $signature,
            ],
        ];
    }

    /**
     * Send the signed callback. Returns true on a 2xx response.
     *
     * @param array<string,mixed> $result
     */
    public function send(string $url, string $secret, array $result): bool
    {
        $request = $this->buildRequest($url, $secret, $result);

        $response = wp_remote_post($url, [
            'timeout' => 15,
            'headers' => $request['headers'],
            'body' => $request['body'],
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $code = (int) wp_remote_retrieve_response_code($response);

        return $code >= 200 && $code < 300;
    }
}
