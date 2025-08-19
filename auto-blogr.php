<?php
/**
 * Plugin Name: AutoBlogr AI Publisher
 * Plugin URI: https://autoblogr.com
 * Description: AI-powered blog drafting and publishing with Slack integration for automated content creation and management.
 * Version: 1.0.0
 * Author: AutoBlogr
 * Author URI: https://autoblogr.com
 * License: GPL-2.0-or-later
 * Text Domain: auto-blogr
 * Domain Path: /languages
 * Requires at least: 6.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: true
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'AUTOBLOGR_VERSION', '1.0.0' );
define( 'AUTOBLOGR_PLUGIN_FILE', __FILE__ );
define( 'AUTOBLOGR_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AUTOBLOGR_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'AUTOBLOGR_INCLUDES_DIR', AUTOBLOGR_PLUGIN_DIR . 'includes/' );
define( 'AUTOBLOGR_ASSETS_URL', AUTOBLOGR_PLUGIN_URL . 'assets/' );

// Composer autoloader.
if ( file_exists( AUTOBLOGR_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once AUTOBLOGR_PLUGIN_DIR . 'vendor/autoload.php';
}

// Manual autoloader fallback for development.
spl_autoload_register( function ( $class ) {
	$prefix = 'AutoBlogr\\';
	$base_dir = AUTOBLOGR_INCLUDES_DIR;

	$len = strlen( $prefix );
	if ( strncmp( $prefix, $class, $len ) !== 0 ) {
		return;
	}

	$relative_class = substr( $class, $len );
	$file = $base_dir . 'class-' . strtolower( str_replace( '_', '-', $relative_class ) ) . '.php';

	if ( file_exists( $file ) ) {
		require $file;
	}
});

use AutoBlogr\Settings;
use AutoBlogr\Rest_Controller;
use AutoBlogr\Cron_Handler;
use AutoBlogr\Callback_Handler;
use AutoBlogr\Auth;

/**
 * Main plugin initialization class.
 *
 * @since 1.0.0
 */
class AutoBlogr {

	/**
	 * Plugin instance.
	 *
	 * @since 1.0.0
	 * @var AutoBlogr
	 */
	private static $instance = null;

	/**
	 * Get plugin instance.
	 *
	 * @since 1.0.0
	 * @return AutoBlogr
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
		add_action( 'plugins_loaded', array( $this, 'init' ) );
		add_action( 'init', array( $this, 'load_textdomain' ) );
	}

	/**
	 * Initialize plugin components.
	 *
	 * @since 1.0.0
	 */
	public function init() {
		// Initialize core components.
		Settings::get_instance();
		Rest_Controller::get_instance();
		Cron_Handler::get_instance();
		Callback_Handler::get_instance();

		// Register REST API routes.
		add_action( 'rest_api_init', array( Rest_Controller::class, 'register_routes' ) );
	}

	/**
	 * Load plugin textdomain for translations.
	 *
	 * @since 1.0.0
	 */
	public function load_textdomain() {
		load_plugin_textdomain(
			'auto-blogr',
			false,
			dirname( plugin_basename( __FILE__ ) ) . '/languages'
		);
	}
}

/**
 * Plugin activation hook.
 *
 * @since 1.0.0
 */
function autoblogr_activate() {
	Settings::activate();
}

/**
 * Plugin deactivation hook.
 *
 * @since 1.0.0
 */
function autoblogr_deactivate() {
	Settings::deactivate();
}

/**
 * Plugin uninstall hook.
 *
 * @since 1.0.0
 */
function autoblogr_uninstall() {
	include_once AUTOBLOGR_PLUGIN_DIR . 'uninstall.php';
}

// Register activation and deactivation hooks.
register_activation_hook( __FILE__, 'autoblogr_activate' );
register_deactivation_hook( __FILE__, 'autoblogr_deactivate' );

// Initialize the plugin.
AutoBlogr::get_instance();
