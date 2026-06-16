<?php

declare(strict_types=1);

namespace AutoBlogr\Rest;

use AutoBlogr\Auth\Authenticator;
use AutoBlogr\Jobs\JobStore;
use AutoBlogr\Jobs\PostProcessor;

/**
 * Registers and serves the custom AutoBlogr REST API.
 *
 * Namespace: autoblogr/v1
 *   POST /jobs        Submit a post-processing job (returns 202 + job id).
 *   GET  /jobs/{id}   Read the status and result of a job.
 *
 * Every route is gated by check_permission(), which requires both a logged-in
 * user (resolved by WordPress from the Application Password) and a valid HMAC
 * signature over the request.
 */
final class Controller
{
    public const NAMESPACE = 'autoblogr/v1';
    public const SECRET_META_KEY = 'autoblogr_signing_secret';

    private Authenticator $authenticator;
    private PostProcessor $processor;
    private JobStore $store;

    public function __construct(Authenticator $authenticator, PostProcessor $processor, JobStore $store)
    {
        $this->authenticator = $authenticator;
        $this->processor = $processor;
        $this->store = $store;
    }

    /**
     * Register both routes with the REST API.
     */
    public function register(): void
    {
        register_rest_route(self::NAMESPACE, '/jobs', [
            'methods' => 'POST',
            'callback' => [$this, 'submit_job'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route(self::NAMESPACE, '/jobs/(?P<id>[a-zA-Z0-9\-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_job'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }

    /**
     * Look up the per-user signing secret stored in user meta.
     */
    public function secret_for_current_user(): string
    {
        $userId = get_current_user_id();
        if ($userId <= 0) {
            return '';
        }

        $secret = get_user_meta($userId, self::SECRET_META_KEY, true);

        return is_string($secret) ? $secret : '';
    }

    /**
     * Permission callback: require an authenticated user plus a valid signature.
     *
     * @return true|\WP_Error
     */
    public function check_permission(\WP_REST_Request $request): bool|\WP_Error
    {
        if (get_current_user_id() <= 0) {
            return new \WP_Error(
                'autoblogr_unauthenticated',
                'A valid WordPress Application Password is required.',
                ['status' => 401]
            );
        }

        $result = $this->authenticator->authenticate(
            $this->secret_for_current_user(),
            (string) $request->get_header(Authenticator::TIMESTAMP_HEADER),
            $request->get_method(),
            $request->get_route(),
            (string) $request->get_body(),
            (string) $request->get_header(Authenticator::SIGNATURE_HEADER)
        );

        if ($result !== true) {
            return new \WP_Error('autoblogr_bad_signature', $result, ['status' => 401]);
        }

        return true;
    }

    /**
     * POST /jobs: validate input, enqueue the job, return 202 Accepted.
     */
    public function submit_job(\WP_REST_Request $request): \WP_REST_Response
    {
        $params = $request->get_json_params();
        if (!is_array($params)) {
            $params = [];
        }

        try {
            $job = $this->processor->enqueue($params);
        } catch (\InvalidArgumentException $e) {
            return new \WP_REST_Response(['error' => $e->getMessage()], 422);
        }

        return new \WP_REST_Response($job, 202);
    }

    /**
     * GET /jobs/{id}: return the current job record, or 404 if unknown.
     */
    public function get_job(\WP_REST_Request $request): \WP_REST_Response
    {
        $id = (string) $request->get_param('id');
        $job = $this->store->find($id);

        if ($job === null) {
            return new \WP_REST_Response(['error' => 'Job not found.'], 404);
        }

        return new \WP_REST_Response($job, 200);
    }
}
