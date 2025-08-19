<?php
/**
 * Plugin uninstall script for AutoBlogr AI Publisher.
 *
 * Removes all plugin data, options, meta, capabilities, and scheduled events.
 *
 * @package AutoBlogr
 * @since 1.0.0
 */

// Prevent direct access and ensure uninstall is called from WordPress.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Remove all plugin data on uninstall.
 *
 * @since 1.0.0
 */
function autoblogr_uninstall_cleanup() {
	global $wpdb;

	// Remove plugin options.
	delete_option( 'autoblogr_options' );
	delete_option( 'autoblogr_hmac_secret' );

	// Remove transients related to tasks and callbacks.
	$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_autoblogr_%'" );
	$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_autoblogr_%'" );

	// Remove post meta created by the plugin.
	$wpdb->query( "DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE '_autoblogr_%'" );

	// Remove custom capabilities.
	$roles = array( 'administrator', 'editor' );
	foreach ( $roles as $role_name ) {
		$role = get_role( $role_name );
		if ( $role ) {
			$role->remove_cap( 'manage_autoblogr_settings' );
			$role->remove_cap( 'publish_autoblogr_posts' );
		}
	}

	// Clear all scheduled cron events.
	wp_clear_scheduled_hook( 'autoblogr_process_publish_task' );
	wp_clear_scheduled_hook( 'autoblogr_send_callback' );
	wp_clear_scheduled_hook( 'autoblogr_cleanup_logs' );

	// Remove log files.
	autoblogr_remove_log_files();

	// Flush rewrite rules.
	flush_rewrite_rules();
}

/**
 * Remove plugin log files.
 *
 * @since 1.0.0
 */
function autoblogr_remove_log_files() {
	$upload_dir = wp_upload_dir();
	$log_dir = $upload_dir['basedir'] . '/autoblogr-logs';

	if ( is_dir( $log_dir ) ) {
		$files = glob( $log_dir . '/*' );
		foreach ( $files as $file ) {
			if ( is_file( $file ) ) {
				unlink( $file );
			}
		}
		rmdir( $log_dir );
	}
}

// Run cleanup for single site.
autoblogr_uninstall_cleanup();

// If multisite, run cleanup for all sites.
if ( is_multisite() ) {
	$sites = get_sites( array( 'number' => 0 ) );
	foreach ( $sites as $site ) {
		switch_to_blog( $site->blog_id );
		autoblogr_uninstall_cleanup();
		restore_current_blog();
	}
}
