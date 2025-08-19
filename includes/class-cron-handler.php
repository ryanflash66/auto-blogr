<?php
/**
 * Cron handler class for AutoBlogr AI Publisher plugin.
 *
 * Handles asynchronous processing of blog post publishing tasks.
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
 * Cron handler class for asynchronous task processing.
 *
 * @since 1.0.0
 */
class Cron_Handler {

	/**
	 * Handler instance.
	 *
	 * @since 1.0.0
	 * @var Cron_Handler
	 */
	private static $instance = null;

	/**
	 * Maximum retry attempts for failed tasks.
	 *
	 * @since 1.0.0
	 * @var int
	 */
	const MAX_RETRIES = 3;

	/**
	 * Get handler instance.
	 *
	 * @since 1.0.0
	 * @return Cron_Handler
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
		add_action( 'autoblogr_process_publish_task', array( $this, 'process_publish_task' ) );
		add_action( 'autoblogr_cleanup_logs', array( $this, 'cleanup_old_logs' ) );
		add_action( 'init', array( $this, 'schedule_recurring_tasks' ) );
	}

	/**
	 * Schedule recurring tasks if not already scheduled.
	 *
	 * @since 1.0.0
	 */
	public function schedule_recurring_tasks() {
		// Schedule log cleanup if not already scheduled.
		if ( ! wp_next_scheduled( 'autoblogr_cleanup_logs' ) ) {
			wp_schedule_event( time(), 'daily', 'autoblogr_cleanup_logs' );
		}
	}

	/**
	 * Process a publish task.
	 *
	 * Downloads media, creates post, and sends status callback.
	 *
	 * @since 1.0.0
	 * @param string $task_id Unique task identifier.
	 */
	public function process_publish_task( $task_id ) {
		// Retrieve task data.
		$task_data = get_transient( 'autoblogr_task_' . $task_id );
		if ( false === $task_data ) {
			$this->log_error( 'Task data not found', array( 'task_id' => $task_id ) );
			return;
		}

		// Initialize retry counter if not set.
		if ( ! isset( $task_data['retry_count'] ) ) {
			$task_data['retry_count'] = 0;
		}

		$this->log_info( 'Processing publish task', array( 'task_id' => $task_id, 'retry' => $task_data['retry_count'] ) );
		try {
			// Validate and download hero image if provided.
			$featured_image_id = null;
			if ( ! empty( $task_data['hero_image_url'] ) ) {
				// Enforce HTTPS for image URLs.
				if ( ! str_starts_with( $task_data['hero_image_url'], 'https://' ) ) {
					throw new \Exception( __( 'Image URL must use HTTPS.', 'auto-blogr' ) );
				}

				$featured_image_id = $this->download_and_attach_image(
					$task_data['hero_image_url'],
					$task_data['title']
				);

				if ( is_wp_error( $featured_image_id ) ) {
					throw new \Exception( 'Failed to download hero image: ' . $featured_image_id->get_error_message() );
				}
			}

			// Prepare post data.
			$post_data = array(
				'post_title'   => $task_data['title'],
				'post_content' => $task_data['content'],
				'post_excerpt' => $task_data['excerpt'] ?? '',
				'post_status'  => $task_data['post_status'],
				'post_type'    => $task_data['post_type'],
				'post_author'  => $task_data['author_id'],
				'meta_input'   => array(),
			);

			// Add custom meta data.
			if ( ! empty( $task_data['autoblogr_blog_post_id'] ) ) {
				$post_data['meta_input']['_autoblogr_blog_post_id'] = $task_data['autoblogr_blog_post_id'];
			}

			if ( ! empty( $task_data['seo_title'] ) ) {
				$post_data['meta_input']['_autoblogr_seo_title'] = $task_data['seo_title'];
			}

			if ( ! empty( $task_data['meta_description'] ) ) {
				$post_data['meta_input']['_autoblogr_meta_description'] = $task_data['meta_description'];
			}

			// Add task tracking meta.
			$post_data['meta_input']['_autoblogr_task_id'] = $task_id;
			$post_data['meta_input']['_autoblogr_published_at'] = current_time( 'mysql' );

			// Insert the post.
			$post_id = wp_insert_post( $post_data, true );

			if ( is_wp_error( $post_id ) ) {
				throw new \Exception( 'Failed to create post: ' . $post_id->get_error_message() );
			}

			// Set featured image if downloaded.
			if ( $featured_image_id ) {
				set_post_thumbnail( $post_id, $featured_image_id );
			}

			// Process tags.
			if ( ! empty( $task_data['tags'] ) && is_array( $task_data['tags'] ) ) {
				wp_set_post_tags( $post_id, $task_data['tags'] );
			}

			// Process categories.
			if ( ! empty( $task_data['categories'] ) && is_array( $task_data['categories'] ) ) {
				$category_ids = $this->process_categories( $task_data['categories'] );
				wp_set_post_categories( $post_id, $category_ids );
			} else {
				// Assign default category if none provided.
				$default_category = get_option( 'default_category', 1 );
				wp_set_post_categories( $post_id, array( $default_category ) );
			}

			// Clean up task data.
			delete_transient( 'autoblogr_task_' . $task_id );

			// Send success callback.
			$callback_handler = Callback_Handler::get_instance();
			$callback_handler->send_final_callback( $task_id, 'published', $post_id );

			$this->log_info( 'Post published successfully', array(
				'task_id' => $task_id,
				'post_id' => $post_id,
				'title'   => $task_data['title'],
			) );

		} catch ( \Exception $e ) {
			$this->handle_task_failure( $task_id, $task_data, $e->getMessage() );
		}
	}

	/**
	 * Handle task failure with retry logic.
	 *
	 * @since 1.0.0
	 * @param string $task_id Task identifier.
	 * @param array  $task_data Task data.
	 * @param string $error_message Error message.
	 */
	private function handle_task_failure( $task_id, $task_data, $error_message ) {
		$task_data['retry_count']++;

		$this->log_error( 'Task failed', array(
			'task_id'       => $task_id,
			'retry_count'   => $task_data['retry_count'],
			'error_message' => $error_message,
		) );
		if ( $task_data['retry_count'] < self::MAX_RETRIES ) {
			// Calculate exponential backoff delay (5s, 30s, 120s).
			$delays = array( 5, 30, 120 );
			$delay = $delays[ $task_data['retry_count'] - 1 ] ?? 300;

			// Update task data and reschedule.
			set_transient( 'autoblogr_task_' . $task_id, $task_data, HOUR_IN_SECONDS );
			wp_schedule_single_event( time() + $delay, 'autoblogr_process_publish_task', array( $task_id ) );

			$this->log_info( 'Task rescheduled for retry', array(
				'task_id' => $task_id,
				'delay'   => $delay,
			) );
		} else {
			// Maximum retries exceeded, send failure callback.
			delete_transient( 'autoblogr_task_' . $task_id );

			$callback_handler = Callback_Handler::get_instance();
			$callback_handler->send_final_callback( $task_id, 'error', null, $error_message );

			$this->log_error( 'Task permanently failed', array(
				'task_id'       => $task_id,
				'error_message' => $error_message,
			) );

			// Send admin notification for permanent failures.
			$this->send_admin_notification( $task_id, $task_data, $error_message );
		}
	}

	/**
	 * Download and attach image to media library.
	 *
	 * @since 1.0.0
	 * @param string $image_url Image URL to download.
	 * @param string $title Post title for image description.
	 * @return int|WP_Error Attachment ID on success, WP_Error on failure.
	 */
	private function download_and_attach_image( $image_url, $title ) {
		// Validate URL scheme.
		if ( 'https' !== wp_parse_url( $image_url, PHP_URL_SCHEME ) ) {
			return new WP_Error( 'insecure_url', __( 'Image URL must use HTTPS.', 'auto-blogr' ) );
		}

		// Include required WordPress functions.
		if ( ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}

		// Download the image.
		$temp_file = download_url( $image_url, 300 ); // 5 minute timeout.

		if ( is_wp_error( $temp_file ) ) {
			return $temp_file;
		}

		// Prepare file array for media_handle_sideload.
		$file_array = array(
			'name'     => basename( wp_parse_url( $image_url, PHP_URL_PATH ) ),
			'tmp_name' => $temp_file,
		);

		// If filename doesn't have extension, try to determine from Content-Type.
		if ( ! pathinfo( $file_array['name'], PATHINFO_EXTENSION ) ) {
			$headers = wp_remote_head( $image_url );
			if ( ! is_wp_error( $headers ) ) {
				$content_type = wp_remote_retrieve_header( $headers, 'content-type' );
				$extension = $this->get_extension_from_mime_type( $content_type );
				if ( $extension ) {
					$file_array['name'] .= '.' . $extension;
				}
			}
		}

		// Create attachment.
		$attachment_id = media_handle_sideload( $file_array, 0, $title );

		// Clean up temp file.
		if ( file_exists( $temp_file ) ) {
			unlink( $temp_file );
		}

		return $attachment_id;
	}

	/**
	 * Get file extension from MIME type.
	 *
	 * @since 1.0.0
	 * @param string $mime_type MIME type.
	 * @return string|false File extension or false if not found.
	 */
	private function get_extension_from_mime_type( $mime_type ) {
		$mime_types = array(
			'image/jpeg' => 'jpg',
			'image/png'  => 'png',
			'image/gif'  => 'gif',
			'image/webp' => 'webp',
		);

		return $mime_types[ $mime_type ] ?? false;
	}

	/**
	 * Process categories and return category IDs.
	 *
	 * Creates categories if they don't exist.
	 *
	 * @since 1.0.0
	 * @param array $categories Array of category names.
	 * @return array Array of category IDs.
	 */
	private function process_categories( $categories ) {
		$category_ids = array();

		foreach ( $categories as $category_name ) {
			$category_name = trim( $category_name );
			if ( empty( $category_name ) ) {
				continue;
			}

			// Check if category exists.
			$category = get_term_by( 'name', $category_name, 'category' );

			if ( ! $category ) {
				// Create new category.
				$result = wp_insert_term( $category_name, 'category' );
				if ( ! is_wp_error( $result ) ) {
					$category_ids[] = $result['term_id'];
				}
			} else {
				$category_ids[] = $category->term_id;
			}
		}

		return $category_ids;
	}

	/**
	 * Send admin notification for permanent task failure.
	 *
	 * @since 1.0.0
	 * @param string $task_id Task identifier.
	 * @param array  $task_data Task data.
	 * @param string $error_message Error message.
	 */
	private function send_admin_notification( $task_id, $task_data, $error_message ) {
		$admin_email = get_option( 'admin_email' );
		if ( empty( $admin_email ) ) {
			return;
		}

		$subject = sprintf(
			/* translators: %s: Site name */
			__( '[%s] AutoBlogr: Post Publishing Failed', 'auto-blogr' ),
			get_bloginfo( 'name' )
		);

		$message = sprintf(
			/* translators: 1: Task ID, 2: Post title, 3: Error message, 4: Admin URL */
			__(
				"A blog post failed to publish after multiple attempts.\n\n" .
				"Task ID: %1\$s\n" .
				"Post Title: %2\$s\n" .
				"Error: %3\$s\n\n" .
				"Please check the AutoBlogr settings and logs for more details: %4\$s",
				'auto-blogr'
			),
			$task_id,
			$task_data['title'] ?? __( 'Unknown', 'auto-blogr' ),
			$error_message,
			admin_url( 'admin.php?page=autoblogr-settings' )
		);

		wp_mail( $admin_email, $subject, $message );
	}

	/**
	 * Clean up old log files.
	 *
	 * Removes log files older than 30 days.
	 *
	 * @since 1.0.0
	 */
	public function cleanup_old_logs() {
		$upload_dir = wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/autoblogr-logs';

		if ( ! is_dir( $log_dir ) ) {
			return;
		}

		$files = glob( $log_dir . '/*.log' );
		$cutoff_time = time() - ( 30 * DAY_IN_SECONDS );

		foreach ( $files as $file ) {
			if ( filemtime( $file ) < $cutoff_time ) {
				unlink( $file );
			}
		}

		$this->log_info( 'Log cleanup completed', array( 'files_checked' => count( $files ) ) );
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
