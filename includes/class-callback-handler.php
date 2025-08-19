<?php
/**
 * Callback handler class for AutoBlogr AI Publisher plugin.
 *
 * Handles sending status callbacks to the AutoBlogr API.
 *
 * @package AutoBlogr
 * @since 1.0.0
 */

namespace AutoBlogr;

use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Callback handler class for sending status updates.
 *
 * @since 1.0.0
 */
class Callback_Handler {

	/**
	 * Handler instance.
	 *
	 * @since 1.0.0
	 * @var Callback_Handler
	 */
	private static $instance = null;

	/**
	 * Maximum retry attempts for callbacks.
	 *
	 * @since 1.0.0
	 * @var int
	 */
	const MAX_RETRIES = 5;

	/**
	 * Get handler instance.
	 *
	 * @since 1.0.0
	 * @return Callback_Handler
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
		add_action( 'autoblogr_send_callback', array( $this, 'send_callback' ), 10, 2 );
	}

	/**
	 * Send initial callback when task is queued.
	 *
	 * @since 1.0.0
	 * @param string $task_id Task identifier.
	 * @param string $status Initial status (usually 'queued').
	 */
	public function send_initial_callback( $task_id, $status ) {
		$callback_data = array(
			'task_id'   => $task_id,
			'status'    => $status,
			'timestamp' => current_time( 'mysql' ),
		);

		$this->schedule_callback( $callback_data );
	}

	/**
	 * Send final callback when task is completed or failed.
	 *
	 * @since 1.0.0
	 * @param string      $task_id Task identifier.
	 * @param string      $status Final status ('published' or 'error').
	 * @param int|null    $post_id WordPress post ID if successful.
	 * @param string|null $error_message Error message if failed.
	 */
	public function send_final_callback( $task_id, $status, $post_id = null, $error_message = null ) {
		$callback_data = array(
			'task_id'   => $task_id,
			'status'    => $status,
			'timestamp' => current_time( 'mysql' ),
		);

		if ( 'published' === $status && $post_id ) {
			$callback_data['wordpress_post_id'] = $post_id;
			$callback_data['post_url'] = get_permalink( $post_id );
			$callback_data['edit_url'] = get_edit_post_link( $post_id );
		}

		if ( 'error' === $status && $error_message ) {
			$callback_data['error_message'] = $error_message;
		}

		$this->schedule_callback( $callback_data );
	}

	/**
	 * Schedule a callback to be sent.
	 *
	 * @since 1.0.0
	 * @param array $callback_data Callback data to send.
	 */
	private function schedule_callback( $callback_data ) {
		// Generate unique callback ID.
		$callback_id = wp_generate_uuid4();
		$callback_data['callback_id'] = $callback_id;
		$callback_data['retry_count'] = 0;

		// Store callback data.
		set_transient( 'autoblogr_callback_' . $callback_id, $callback_data, DAY_IN_SECONDS );

		// Schedule immediate callback.
		wp_schedule_single_event( time(), 'autoblogr_send_callback', array( $callback_id, 0 ) );

		$this->log_info( 'Callback scheduled', array(
			'callback_id' => $callback_id,
			'task_id'     => $callback_data['task_id'],
			'status'      => $callback_data['status'],
		) );
	}

	/**
	 * Send callback via cron action.
	 *
	 * @since 1.0.0
	 * @param string $callback_id Callback identifier.
	 * @param int    $retry_count Current retry attempt.
	 */
	public function send_callback( $callback_id, $retry_count ) {
		// Retrieve callback data.
		$callback_data = get_transient( 'autoblogr_callback_' . $callback_id );
		if ( false === $callback_data ) {
			$this->log_error( 'Callback data not found', array( 'callback_id' => $callback_id ) );
			return;
		}

		// Update retry count.
		$callback_data['retry_count'] = $retry_count;

		$this->log_info( 'Sending callback', array(
			'callback_id' => $callback_id,
			'task_id'     => $callback_data['task_id'],
			'retry_count' => $retry_count,
		) );

		// Get callback URL and API key.
		$callback_url = Settings::get_option( 'callback_url' );
		$api_key = Settings::get_option( 'callback_api_key' );

		if ( empty( $callback_url ) || empty( $api_key ) ) {
			$this->log_error( 'Callback URL or API key not configured', array( 'callback_id' => $callback_id ) );
			delete_transient( 'autoblogr_callback_' . $callback_id );
			return;
		}

		// Prepare request headers.
		$headers = array(
			'Content-Type'              => 'application/json',
			'X-AutoBlogr-Callback-Token' => $api_key,
			'User-Agent'                => 'AutoBlogr-WordPress-Plugin/' . AUTOBLOGR_VERSION,
		);

		// Prepare request body.
		$body = wp_json_encode( $callback_data );

		// Send HTTP request.
		$response = wp_remote_post( $callback_url, array(
			'headers'     => $headers,
			'body'        => $body,
			'timeout'     => 30,
			'redirection' => 0,
			'sslverify'   => true,
		) );

		if ( is_wp_error( $response ) ) {
			$this->handle_callback_failure( $callback_id, $callback_data, $response->get_error_message() );
			return;
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		$response_body = wp_remote_retrieve_body( $response );

		if ( $response_code >= 200 && $response_code < 300 ) {
			// Success - clean up callback data.
			delete_transient( 'autoblogr_callback_' . $callback_id );

			$this->log_info( 'Callback sent successfully', array(
				'callback_id'   => $callback_id,
				'task_id'       => $callback_data['task_id'],
				'response_code' => $response_code,
			) );
		} else {
			$error_message = sprintf(
				/* translators: 1: HTTP response code, 2: Response body */
				__( 'HTTP %1$d: %2$s', 'auto-blogr' ),
				$response_code,
				$response_body
			);

			$this->handle_callback_failure( $callback_id, $callback_data, $error_message );
		}
	}

	/**
	 * Handle callback failure with retry logic.
	 *
	 * @since 1.0.0
	 * @param string $callback_id Callback identifier.
	 * @param array  $callback_data Callback data.
	 * @param string $error_message Error message.
	 */
	private function handle_callback_failure( $callback_id, $callback_data, $error_message ) {
		$retry_count = $callback_data['retry_count'] + 1;

		$this->log_error( 'Callback failed', array(
			'callback_id'   => $callback_id,
			'task_id'       => $callback_data['task_id'],
			'retry_count'   => $retry_count,
			'error_message' => $error_message,
		) );

		if ( $retry_count < self::MAX_RETRIES ) {
			// Calculate exponential backoff delay (1m, 5m, 15m, 1h, 3h).
			$delays = array( 60, 300, 900, 3600, 10800 );
			$delay = $delays[ $retry_count - 1 ] ?? 21600; // 6 hours fallback.

			// Update callback data.
			$callback_data['retry_count'] = $retry_count;
			set_transient( 'autoblogr_callback_' . $callback_id, $callback_data, DAY_IN_SECONDS );

			// Schedule retry.
			wp_schedule_single_event( time() + $delay, 'autoblogr_send_callback', array( $callback_id, $retry_count ) );

			$this->log_info( 'Callback rescheduled for retry', array(
				'callback_id' => $callback_id,
				'delay'       => $delay,
			) );
		} else {
			// Maximum retries exceeded - give up.
			delete_transient( 'autoblogr_callback_' . $callback_id );

			$this->log_error( 'Callback permanently failed', array(
				'callback_id'   => $callback_id,
				'task_id'       => $callback_data['task_id'],
				'error_message' => $error_message,
			) );

			// Send admin notification for permanent callback failures.
			$this->send_admin_notification( $callback_data, $error_message );
		}
	}

	/**
	 * Send admin notification for permanent callback failure.
	 *
	 * @since 1.0.0
	 * @param array  $callback_data Callback data.
	 * @param string $error_message Error message.
	 */
	private function send_admin_notification( $callback_data, $error_message ) {
		$admin_email = get_option( 'admin_email' );
		if ( empty( $admin_email ) ) {
			return;
		}

		$subject = sprintf(
			/* translators: %s: Site name */
			__( '[%s] AutoBlogr: Callback Failed', 'auto-blogr' ),
			get_bloginfo( 'name' )
		);

		$message = sprintf(
			/* translators: 1: Task ID, 2: Status, 3: Error message, 4: Admin URL */
			__(
				"A status callback failed to send after multiple attempts.\n\n" .
				"Task ID: %1\$s\n" .
				"Status: %2\$s\n" .
				"Error: %3\$s\n\n" .
				"Please check your callback URL and API key settings: %4\$s",
				'auto-blogr'
			),
			$callback_data['task_id'] ?? __( 'Unknown', 'auto-blogr' ),
			$callback_data['status'] ?? __( 'Unknown', 'auto-blogr' ),
			$error_message,
			admin_url( 'admin.php?page=autoblogr-settings' )
		);

		wp_mail( $admin_email, $subject, $message );
	}

	/**
	 * Get callback status for a task.
	 *
	 * @since 1.0.0
	 * @param string $task_id Task identifier.
	 * @return array|null Callback status data or null if not found.
	 */
	public function get_callback_status( $task_id ) {
		global $wpdb;

		// Search for callback transients related to this task.
		$transient_name = $wpdb->esc_like( '_transient_autoblogr_callback_' ) . '%';
		$transients = $wpdb->get_results( $wpdb->prepare(
			"SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE %s",
			$transient_name
		) );

		foreach ( $transients as $transient ) {
			$callback_data = maybe_unserialize( $transient->option_value );
			if ( is_array( $callback_data ) && isset( $callback_data['task_id'] ) && $callback_data['task_id'] === $task_id ) {
				return $callback_data;
			}
		}

		return null;
	}

	/**
	 * Manually retry a failed callback.
	 *
	 * @since 1.0.0
	 * @param string $callback_id Callback identifier.
	 * @return bool True if retry was scheduled, false otherwise.
	 */
	public function retry_callback( $callback_id ) {
		$callback_data = get_transient( 'autoblogr_callback_' . $callback_id );
		if ( false === $callback_data ) {
			return false;
		}

		// Reset retry count.
		$callback_data['retry_count'] = 0;
		set_transient( 'autoblogr_callback_' . $callback_id, $callback_data, DAY_IN_SECONDS );

		// Schedule immediate retry.
		wp_schedule_single_event( time(), 'autoblogr_send_callback', array( $callback_id, 0 ) );

		$this->log_info( 'Callback manually retried', array(
			'callback_id' => $callback_id,
			'task_id'     => $callback_data['task_id'],
		) );

		return true;
	}

	/**
	 * Log informational message.
	 *
	 * @since 1.0.0
	 * @param string $message Log message.
	 * @param array  $context Additional context data.
	 */
	private function log_info( $message, $context = array() ) {
		if ( 'all' === Settings::get_option( 'log_level', 'errors' ) ) {
			$log_entry = array(
				'timestamp' => current_time( 'mysql' ),
				'level'     => 'INFO',
				'message'   => $message,
				'context'   => $context,
			);
			$this->write_log( $log_entry );
		}
	}

	/**
	 * Log error message.
	 *
	 * @since 1.0.0
	 * @param string $message Log message.
	 * @param array  $context Additional context data.
	 */
	private function log_error( $message, $context = array() ) {
		$log_entry = array(
			'timestamp' => current_time( 'mysql' ),
			'level'     => 'ERROR',
			'message'   => $message,
			'context'   => $context,
		);
		$this->write_log( $log_entry );

		// Also log to PHP error log if WP_DEBUG_LOG is enabled.
		if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
			error_log( sprintf( 'AutoBlogr: %s - %s', $message, wp_json_encode( $context ) ) );
		}
	}

	/**
	 * Write log entry to file.
	 *
	 * @since 1.0.0
	 * @param array $log_entry Log entry data.
	 */
	private function write_log( $log_entry ) {
		$upload_dir = wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/autoblogr-logs';

		// Create log directory if it doesn't exist.
		if ( ! file_exists( $log_dir ) ) {
			wp_mkdir_p( $log_dir );
		}

		$log_file = $log_dir . '/plugin.log';
		$log_line = sprintf(
			"[%s] %s: %s %s\n",
			$log_entry['timestamp'],
			$log_entry['level'],
			$log_entry['message'],
			! empty( $log_entry['context'] ) ? wp_json_encode( $log_entry['context'] ) : ''
		);

		// Append to log file.
		file_put_contents( $log_file, $log_line, FILE_APPEND | LOCK_EX );
	}
}
