<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

/**
 * Minimal stand-ins for the WordPress REST classes the controller type-hints.
 *
 * These are deliberately tiny: they hold just enough state for tests to drive
 * the controller. WordPress core functions (get_current_user_id, wp_remote_post,
 * etc.) are mocked per-test with Brain Monkey rather than defined here.
 */
if (!class_exists('WP_REST_Request')) {
    class WP_REST_Request
    {
        /** @var array<string,string> */
        private array $headers;
        private string $method;
        private string $route;
        private string $body;
        /** @var array<string,mixed> */
        private array $params;

        /**
         * @param array<string,string> $headers
         * @param array<string,mixed>  $params
         */
        public function __construct(
            string $method = 'GET',
            string $route = '/',
            array $headers = [],
            string $body = '',
            array $params = []
        ) {
            $this->method = $method;
            $this->route = $route;
            $this->headers = $headers;
            $this->body = $body;
            $this->params = $params;
        }

        public function get_header(string $name): ?string
        {
            return $this->headers[$name] ?? null;
        }

        public function get_method(): string
        {
            return $this->method;
        }

        public function get_route(): string
        {
            return $this->route;
        }

        public function get_body(): string
        {
            return $this->body;
        }

        /**
         * @return array<string,mixed>|null
         */
        public function get_json_params(): ?array
        {
            $decoded = json_decode($this->body, true);

            return is_array($decoded) ? $decoded : null;
        }

        public function get_param(string $key): mixed
        {
            return $this->params[$key] ?? null;
        }
    }
}

if (!class_exists('WP_REST_Response')) {
    class WP_REST_Response
    {
        public mixed $data;
        public int $status;

        public function __construct(mixed $data = null, int $status = 200)
        {
            $this->data = $data;
            $this->status = $status;
        }

        public function get_data(): mixed
        {
            return $this->data;
        }

        public function get_status(): int
        {
            return $this->status;
        }
    }
}

if (!class_exists('WP_Error')) {
    class WP_Error
    {
        public string $code;
        public string $message;
        /** @var array<string,mixed> */
        public array $data;

        /**
         * @param array<string,mixed> $data
         */
        public function __construct(string $code = '', string $message = '', array $data = [])
        {
            $this->code = $code;
            $this->message = $message;
            $this->data = $data;
        }

        public function get_error_code(): string
        {
            return $this->code;
        }

        public function get_error_message(): string
        {
            return $this->message;
        }
    }
}
