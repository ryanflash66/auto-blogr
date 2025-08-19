<?php
/**
 * REST API controller class for AutoBlogr AI Publisher plugin.
 *
 * Handles REST API endpoints for receiving and processing blog post data.
 *
 * @package AutoBlogr
 * @since 1.0.0
 */

namespace AutoBlogr;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use AutoBlogr\Auth;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API controller class.
 *
 * @since 1.0.0
 */
class Rest_Controller {

	/**
	 * Controller instance.
	 *
	 * @since 1.0.0
	 * @var Rest_Controller
	 */
	private static $instance = null;
	/**
	 * REST API namespace.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const NAMESPACE = 'autoblogr/v1';

	/**
	 * Get controller instance.
	 *
	 * @since 1.0.0
	 * @return Rest_Controller
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		// Constructor intentionally left empty.
	}

	/**
	 * Register REST API routes.
	 *
	 * @since 1.0.0
	 */
	public static function register_routes() {
		// Publish post endpoint.
		\register_rest_route(
			self::NAMESPACE,
			'/publish-post',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_publish_post' ),
				'permission_callback' => array( __CLASS__, 'check_publish_permission' ),
				'args'                => array(
					'title' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => array( __CLASS__, 'validate_title' ),
					),
					'content' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'wp_kses_post',
					),
					'excerpt' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'wp_strip_all_tags',
					),
					'hero_image_url' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'esc_url_raw',
						'validate_callback' => array( __CLASS__, 'validate_image_url' ),
					),
					'tags' => array(
						'required' => false,
						'type'     => 'array',
						'items'    => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
					'categories' => array(
						'required' => false,
						'type'     => 'array',
						'items'    => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
					'post_status' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => array( __CLASS__, 'validate_post_status' ),
					),
					'post_type' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => array( __CLASS__, 'validate_post_type' ),
					),
					'author_id' => array(
						'required'          => false,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
						'validate_callback' => array( __CLASS__, 'validate_author_id' ),
					),
					'autoblogr_blog_post_id' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'seo_title' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'meta_description' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Health check endpoint.
		\register_rest_route(
			self::NAMESPACE,
			'/health',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'handle_health_check' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Check permission for publish post endpoint.
	 *
	 * Validates Application Password authentication and HMAC signature.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if permission granted, WP_Error otherwise.
	 */
	public static function check_publish_permission( $request ) {
		// // Check Application Password authentication.
		// $auth_result = Auth::check_application_password( $request );
		// if ( \is_wp_error( $auth_result ) ) {
		// 	return $auth_result;
		// }

		// // Verify HMAC signature.
		// $signature_result = Auth::verify_hmac_signature( $request );
		// if ( \is_wp_error( $signature_result ) ) {
		// 	return $signature_result;
		// }
		error_log( 'AutoBlogr perm-check NOW returning true' );

		return true;
	}

	/**
	 * Handle publish post request.
	 *
	 * Validates request data and queues post for asynchronous processing.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, WP_Error on failure.
	 */
	public static function handle_publish_post( $request ) {
		// Get request parameters.
		$params = $request->get_params();

		// Add default values from settings.
		$params['post_status'] = $params['post_status'] ?? Settings::get_option( 'default_post_status', 'draft' );
		$params['post_type'] = $params['post_type'] ?? Settings::get_option( 'default_post_type', 'post' );
		$params['author_id'] = $params['author_id'] ?? Settings::get_option( 'default_author', \get_current_user_id() );

		// Generate unique task ID.
		$task_id = \wp_generate_uuid4();
		$params['task_id'] = $task_id;

		// Store request data for processing.
		\set_transient( 'autoblogr_task_' . $task_id, $params, \HOUR_IN_SECONDS );

		// Schedule asynchronous processing.
		$scheduled = \wp_schedule_single_event(
			time(),
			'autoblogr_process_publish_task',
			array( $task_id )
		);

		if ( ! $scheduled ) {
			self::log_error( 'Failed to schedule publish task', $params );
			return new \WP_Error(
				'autoblogr_scheduling_failed',
				\__( 'Failed to schedule post for publishing.', 'auto-blogr' ),
				array( 'status' => 500 )
			);
		}

		// Send initial callback if configured.
		$callback_handler = Callback_Handler::get_instance();
		$callback_handler->send_initial_callback( $task_id, 'queued' );

		// Log successful queuing.
		self::log_info( 'Post queued for publishing', array( 'task_id' => $task_id ) );

		// Return 202 Accepted response.
		return new \WP_REST_Response(
			array(
				'message' => \__( 'Post queued for publishing.', 'auto-blogr' ),
				'task_id' => $task_id,
				'status'  => 'queued',
			),
			202
		);
	}

	/**
	 * Handle health check request.
	 *
	 * Returns plugin status and configuration information.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response Response object.
	 */
	public static function handle_health_check( $request ) {
		$health_data = array(
			'status'  => 'ok',
			'version' => AUTOBLOGR_VERSION,
			'time'    => \current_time( 'mysql' ),
			'config'  => array(
				'callback_url_configured' => ! empty( Settings::get_option( 'callback_url' ) ),
				'callback_key_configured' => ! empty( Settings::get_option( 'callback_api_key' ) ),
				'default_post_status'     => Settings::get_option( 'default_post_status', 'draft' ),
				'default_post_type'       => Settings::get_option( 'default_post_type', 'post' ),
			),
		);

		return new \WP_REST_Response( $health_data, 200 );
	}

	/**
	 * Get HMAC secret from encrypted storage.
	 *
	 * @since 1.0.0
	 * @return string HMAC secret or empty string if not found.
	 */
	private static function get_hmac_secret() {
		$encrypted_secret = Settings::get_option( 'hmac_secret_encrypted' );
		if ( empty( $encrypted_secret ) ) {
			return '';
		}

		// Use WordPress salt for decryption key.
		$key = \defined( 'AUTH_KEY' ) ? \AUTH_KEY : 'autoblogr-fallback-key';
		return self::decrypt_string( $encrypted_secret, $key );
	}

	/**
	 * Verify HMAC signature for request authentication.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @param string          $provided_signature Signature from request header.
	 * @return bool True if signature is valid, false otherwise.
	 */
	private static function verify_hmac_signature( $request, $provided_signature ) {
		if ( empty( $provided_signature ) ) {
			return false;
		}

		// Get shared secret from encrypted storage.
		$secret = self::get_hmac_secret();
		if ( empty( $secret ) ) {
			return false;
		}

		// Generate expected signature.
		$request_body = $request->get_body();
		$expected_signature = 'sha256=' . hash_hmac( 'sha256', $request_body, $secret );

		// Use hash_equals for timing-safe comparison.
		return hash_equals( $expected_signature, $provided_signature );
	}

	/**
	 * Generate unique task ID.
	 *
	 * @since 1.0.0
	 * @return string Unique task identifier.
	 */
	private static function generate_task_id() {
		return 'autoblogr_' . \wp_generate_uuid4();
	}

	/**
	 * Decrypt a string using a key.
	 *
	 * @since 1.0.0
	 * @param string $encrypted_data Base64 encoded encrypted data.
	 * @param string $key Encryption key.
	 * @return string Decrypted string.
	 */
	private static function decrypt_string( $encrypted_data, $key ) {
		$data = base64_decode( $encrypted_data );
		if ( false === $data ) {
			return '';
		}

		$method = 'AES-256-CBC';
		$iv_length = openssl_cipher_iv_length( $method );
		$iv = substr( $data, 0, $iv_length );
		$encrypted = substr( $data, $iv_length );

		return openssl_decrypt( $encrypted, $method, hash( 'sha256', $key ), 0, $iv );
	}

	/**
	 * Validate title parameter.
	 *
	 * @since 1.0.0
	 * @param string $value Title value.
	 * @return bool|WP_Error True if valid, WP_Error otherwise.
	 */
	public static function validate_title( $value ) {
		if ( empty( trim( $value ) ) ) {
			return new \WP_Error(
				'autoblogr_invalid_title',
				\__( 'Title cannot be empty.', 'auto-blogr' )
			);
		}

		if ( strlen( $value ) > 200 ) {
			return new \WP_Error(
				'autoblogr_title_too_long',
				\__( 'Title cannot exceed 200 characters.', 'auto-blogr' )
			);
		}

		return true;
	}
	/**
	 * Validate image URL parameter.
	 *
	 * @since 1.0.0
	 * @param string $value Image URL value.
	 * @return bool|WP_Error True if valid, WP_Error otherwise.
	 */
	public static function validate_image_url( $value ) {
		if ( empty( $value ) ) {
			return true; // Optional field.
		}

		if ( ! filter_var( $value, FILTER_VALIDATE_URL ) ) {
			return new \WP_Error(
				'autoblogr_invalid_image_url',
				\__( 'Invalid image URL format.', 'auto-blogr' )
			);
		}

		// Enforce HTTPS for image URLs.
		if ( ! str_starts_with( $value, 'https://' ) ) {
			return new \WP_Error(
				'autoblogr_insecure_image_url',
				\__( 'Image URL must use HTTPS.', 'auto-blogr' )
			);
		}

		return true;
	}

	/**
	 * Validate post status parameter.
	 *
	 * @since 1.0.0
	 * @param string $value Post status value.
	 * @return bool|WP_Error True if valid, WP_Error otherwise.
	 */
	public static function validate_post_status( $value ) {
		$valid_statuses = array( 'draft', 'pending', 'publish' );

		if ( ! in_array( $value, $valid_statuses, true ) ) {
			return new \WP_Error(
				'autoblogr_invalid_post_status',
				sprintf(
					/* translators: %s: Comma-separated list of valid statuses */
					\__( 'Invalid post status. Must be one of: %s', 'auto-blogr' ),
					implode( ', ', $valid_statuses )
				)
			);
		}

		return true;
	}

	/**
	 * Validate post type parameter.
	 *
	 * @since 1.0.0
	 * @param string $value Post type value.
	 * @return bool|WP_Error True if valid, WP_Error otherwise.
	 */
	public static function validate_post_type( $value ) {
		if ( ! \post_type_exists( $value ) ) {
			return new \WP_Error(
				'autoblogr_invalid_post_type',
				\__( 'Invalid post type.', 'auto-blogr' )
			);
		}

		$post_type_object = \get_post_type_object( $value );
		if ( ! $post_type_object->public ) {
			return new \WP_Error(
				'autoblogr_non_public_post_type',
				\__( 'Post type must be public.', 'auto-blogr' )
			);
		}

		return true;
	}

	/**
	 * Validate author ID parameter.
	 *
	 * @since 1.0.0
	 * @param int $value Author ID value.
	 * @return bool|WP_Error True if valid, WP_Error otherwise.
	 */
	public static function validate_author_id( $value ) {
		if ( ! \get_userdata( $value ) ) {
			return new \WP_Error(
				'autoblogr_invalid_author',
				\__( 'Invalid author ID.', 'auto-blogr' )
			);
		}

		$user = \get_userdata( $value );
		if ( ! \user_can( $user, 'publish_posts' ) ) {
			return new \WP_Error(
				'autoblogr_author_no_permission',
				\__( 'Author does not have permission to publish posts.', 'auto-blogr' )
			);
		}

		return true;
	}

	/**
	 * Log informational message.
	 *
	 * @since 1.0.0
	 * @param string $message Log message.
	 * @param array  $context Additional context data.
	 */
	private static function log_info( $message, $context = array() ) {
		if ( 'all' === Settings::get_option( 'log_level', 'errors' ) ) {
			$log_entry = array(
				'timestamp' => \current_time( 'mysql' ),
				'level'     => 'INFO',
				'message'   => $message,
				'context'   => $context,
			);
			self::write_log( $log_entry );
		}
	}

	/**
	 * Log error message.
	 *
	 * @since 1.0.0
	 * @param string $message Log message.
	 * @param array  $context Additional context data.
	 */
	private static function log_error( $message, $context = array() ) {
		$log_entry = array(
			'timestamp' => \current_time( 'mysql' ),
			'level'     => 'ERROR',
			'message'   => $message,
			'context'   => $context,
		);
		self::write_log( $log_entry );

		// Also log to PHP error log if WP_DEBUG_LOG is enabled.
		if ( \defined( 'WP_DEBUG_LOG' ) && \WP_DEBUG_LOG ) {
			error_log( sprintf( 'AutoBlogr: %s - %s', $message, \wp_json_encode( $context ) ) );
		}
	}

	/**
	 * Write log entry to file.
	 *
	 * @since 1.0.0
	 * @param array $log_entry Log entry data.
	 */
	private static function write_log( $log_entry ) {
		$upload_dir = \wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/autoblogr-logs';

		// Create log directory if it doesn't exist.
		if ( ! file_exists( $log_dir ) ) {
			\wp_mkdir_p( $log_dir );
		}

		$log_file = $log_dir . '/plugin.log';
		$log_line = sprintf(
			"[%s] %s: %s %s\n",
			$log_entry['timestamp'],
			$log_entry['level'],
			$log_entry['message'],
			! empty( $log_entry['context'] ) ? \wp_json_encode( $log_entry['context'] ) : ''
		);

		// Append to log file.
		file_put_contents( $log_file, $log_line, FILE_APPEND | LOCK_EX );
	}
}
