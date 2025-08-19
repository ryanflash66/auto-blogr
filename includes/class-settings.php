<?php
/**
 * Settings management class for AutoBlogr AI Publisher plugin.
 *
 * Handles plugin settings registration, admin page creation, and option management.
 *
 * @package AutoBlogr
 * @since 1.0.0
 */

namespace AutoBlogr;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings class for managing plugin configuration.
 *
 * @since 1.0.0
 */
class Settings {

	/**
	 * Settings instance.
	 *
	 * @since 1.0.0
	 * @var Settings
	 */
	private static $instance = null;

	/**
	 * Plugin option group.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const OPTION_GROUP = 'autoblogr_settings';
	/**
	 * Plugin options key.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const OPTIONS_KEY = 'autoblogr_options';

	/**
	 * HMAC secret key.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const HMAC_SECRET_KEY = 'autoblogr_hmac_secret';

	/**
	 * Get settings instance.
	 *
	 * @since 1.0.0
	 * @return Settings
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
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Plugin activation hook.
	 *
	 * Sets default options and schedules necessary cron jobs.
	 *
	 * @since 1.0.0
	 */
	public static function activate() {
		// Set default options.
		$default_options = array(
			'callback_url'         => '',
			'callback_api_key'     => '',
			'default_post_status'  => 'draft',
			'default_post_type'    => 'post',
			'default_author'       => get_current_user_id(),
			'log_level'            => 'errors',
		);

		add_option( self::OPTIONS_KEY, $default_options );

		// Add custom capabilities.
		$admin_role = get_role( 'administrator' );
		$editor_role = get_role( 'editor' );

		if ( $admin_role ) {
			$admin_role->add_cap( 'manage_autoblogr_settings' );
			$admin_role->add_cap( 'publish_autoblogr_posts' );
		}

		if ( $editor_role ) {
			$editor_role->add_cap( 'publish_autoblogr_posts' );
		}

		// Flush rewrite rules.
		flush_rewrite_rules();
	}

	/**
	 * Plugin deactivation hook.
	 *
	 * Clears scheduled cron jobs but retains options and meta.
	 *
	 * @since 1.0.0
	 */
	public static function deactivate() {
		// Clear scheduled cron jobs.
		wp_clear_scheduled_hook( 'autoblogr_process_queue' );
		wp_clear_scheduled_hook( 'autoblogr_send_callback' );
		wp_clear_scheduled_hook( 'autoblogr_cleanup_logs' );

		// Flush rewrite rules.
		flush_rewrite_rules();
	}

	/**
	 * Add admin menu pages.
	 *
	 * @since 1.0.0
	 */
	public function add_admin_menu() {
		// Main menu page.
		add_menu_page(
			__( 'AutoBlogr Posts', 'auto-blogr' ),
			__( 'AutoBlogr Posts', 'auto-blogr' ),
			'edit_posts',
			'autoblogr-posts',
			array( $this, 'render_posts_page' ),
			'dashicons-edit-page',
			30
		);

		// Settings submenu.
		add_submenu_page(
			'autoblogr-posts',
			__( 'AutoBlogr Settings', 'auto-blogr' ),
			__( 'Settings', 'auto-blogr' ),
			'manage_autoblogr_settings',
			'autoblogr-settings',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register plugin settings.
	 *
	 * @since 1.0.0
	 */
	public function register_settings() {
		register_setting(
			self::OPTION_GROUP,
			self::OPTIONS_KEY,
			array(
				'sanitize_callback' => array( $this, 'sanitize_options' ),
				'default'           => array(),
			)
		);

		// API Settings section.
		add_settings_section(
			'autoblogr_api_settings',
			__( 'API Configuration', 'auto-blogr' ),
			array( $this, 'render_api_settings_section' ),
			'autoblogr-settings'
		);

		// Callback URL field.
		add_settings_field(
			'callback_url',
			__( 'Callback URL', 'auto-blogr' ),
			array( $this, 'render_callback_url_field' ),
			'autoblogr-settings',
			'autoblogr_api_settings'
		);

		// API Key field.
		add_settings_field(
			'callback_api_key',
			__( 'Callback API Key', 'auto-blogr' ),
			array( $this, 'render_callback_api_key_field' ),
			'autoblogr-settings',
			'autoblogr_api_settings'
		);

		// Publishing Settings section.
		add_settings_section(
			'autoblogr_publishing_settings',
			__( 'Publishing Configuration', 'auto-blogr' ),
			array( $this, 'render_publishing_settings_section' ),
			'autoblogr-settings'
		);

		// Default post status field.
		add_settings_field(
			'default_post_status',
			__( 'Default Post Status', 'auto-blogr' ),
			array( $this, 'render_default_post_status_field' ),
			'autoblogr-settings',
			'autoblogr_publishing_settings'
		);

		// Default post type field.
		add_settings_field(
			'default_post_type',
			__( 'Default Post Type', 'auto-blogr' ),
			array( $this, 'render_default_post_type_field' ),
			'autoblogr-settings',
			'autoblogr_publishing_settings'
		);

		// Default author field.
		add_settings_field(
			'default_author',
			__( 'Default Author', 'auto-blogr' ),
			array( $this, 'render_default_author_field' ),
			'autoblogr-settings',
			'autoblogr_publishing_settings'
		);

		// Log level field.
		add_settings_field(
			'log_level',
			__( 'Log Level', 'auto-blogr' ),
			array( $this, 'render_log_level_field' ),
			'autoblogr-settings',
			'autoblogr_publishing_settings'
		);
	}

	/**
	 * Sanitize plugin options.
	 *
	 * @since 1.0.0
	 * @param array $input Raw input values.
	 * @return array Sanitized values.
	 */
	public function sanitize_options( $input ) {
		$sanitized = array();

		$sanitized['callback_url'] = esc_url_raw( $input['callback_url'] ?? '' );
		$sanitized['callback_api_key'] = sanitize_text_field( $input['callback_api_key'] ?? '' );
		$sanitized['default_post_status'] = sanitize_text_field( $input['default_post_status'] ?? 'draft' );
		$sanitized['default_post_type'] = sanitize_text_field( $input['default_post_type'] ?? 'post' );
		$sanitized['default_author'] = absint( $input['default_author'] ?? get_current_user_id() );
		$sanitized['log_level'] = sanitize_text_field( $input['log_level'] ?? 'errors' );

		return $sanitized;
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @since 1.0.0
	 * @param string $hook_suffix Current admin page hook suffix.
	 */	public function enqueue_admin_assets( $hook_suffix ) {
		// Only enqueue on AutoBlogr admin pages.
		if ( ! in_array( $hook_suffix, array( 'toplevel_page_autoblogr-posts', 'autoblogr-posts_page_autoblogr-settings' ), true ) ) {
			return;
		}

		wp_enqueue_style(
			'autoblogr-admin',
			AUTOBLOGR_ASSETS_URL . 'css/admin.css',
			array(),
			AUTOBLOGR_VERSION
		);

		wp_enqueue_script(
			'autoblogr-admin',
			AUTOBLOGR_ASSETS_URL . 'js/admin.js',
			array( 'jquery' ),
			AUTOBLOGR_VERSION,
			true
		);

		wp_localize_script(
			'autoblogr-admin',
			'autoblogr_admin',
			array(
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'nonce'    => wp_create_nonce( 'autoblogr_admin_nonce' ),
			)
		);
	}

	/**
	 * Render posts management page.
	 *
	 * @since 1.0.0
	 */
	public function render_posts_page() {
		echo '<div class="wrap">';
		echo '<h1>' . esc_html__( 'AutoBlogr Posts', 'auto-blogr' ) . '</h1>';
		echo '<p>' . esc_html__( 'Manage AI-published posts and monitor publishing status.', 'auto-blogr' ) . '</p>';
		echo '</div>';
	}

	/**
	 * Render settings page.
	 *
	 * @since 1.0.0
	 */
	public function render_settings_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'AutoBlogr Settings', 'auto-blogr' ); ?></h1>
			<form method="post" action="options.php">
				<?php
				settings_fields( self::OPTION_GROUP );
				do_settings_sections( 'autoblogr-settings' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render API settings section description.
	 *
	 * @since 1.0.0
	 */
	public function render_api_settings_section() {
		echo '<p>' . esc_html__( 'Configure API endpoints and authentication for AutoBlogr integration.', 'auto-blogr' ) . '</p>';
	}

	/**
	 * Render publishing settings section description.
	 *
	 * @since 1.0.0
	 */
	public function render_publishing_settings_section() {
		echo '<p>' . esc_html__( 'Configure default publishing behavior and logging preferences.', 'auto-blogr' ) . '</p>';
	}

	/**
	 * Render callback URL field.
	 *
	 * @since 1.0.0
	 */
	public function render_callback_url_field() {
		$options = get_option( self::OPTIONS_KEY, array() );
		$value = $options['callback_url'] ?? '';
		?>
		<input type="url" id="callback_url" name="<?php echo esc_attr( self::OPTIONS_KEY ); ?>[callback_url]" value="<?php echo esc_attr( $value ); ?>" class="regular-text" />
		<p class="description"><?php esc_html_e( 'URL to send status callbacks to AutoBlogr API.', 'auto-blogr' ); ?></p>
		<?php
	}

	/**
	 * Render callback API key field.
	 *
	 * @since 1.0.0
	 */
	public function render_callback_api_key_field() {
		$options = get_option( self::OPTIONS_KEY, array() );
		$value = $options['callback_api_key'] ?? '';
		?>
		<input type="password" id="callback_api_key" name="<?php echo esc_attr( self::OPTIONS_KEY ); ?>[callback_api_key]" value="<?php echo esc_attr( $value ); ?>" class="regular-text" />
		<p class="description"><?php esc_html_e( 'API key for authenticating callback requests.', 'auto-blogr' ); ?></p>
		<?php
	}

	/**
	 * Render default post status field.
	 *
	 * @since 1.0.0
	 */
	public function render_default_post_status_field() {
		$options = get_option( self::OPTIONS_KEY, array() );
		$value = $options['default_post_status'] ?? 'draft';
		$statuses = array(
			'draft'   => __( 'Draft', 'auto-blogr' ),
			'pending' => __( 'Pending Review', 'auto-blogr' ),
			'publish' => __( 'Published', 'auto-blogr' ),
		);
		?>
		<select id="default_post_status" name="<?php echo esc_attr( self::OPTIONS_KEY ); ?>[default_post_status]">
			<?php foreach ( $statuses as $status => $label ) : ?>
				<option value="<?php echo esc_attr( $status ); ?>" <?php selected( $value, $status ); ?>><?php echo esc_html( $label ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	/**
	 * Render default post type field.
	 *
	 * @since 1.0.0
	 */
	public function render_default_post_type_field() {
		$options = get_option( self::OPTIONS_KEY, array() );
		$value = $options['default_post_type'] ?? 'post';
		$post_types = get_post_types( array( 'public' => true ), 'objects' );
		?>
		<select id="default_post_type" name="<?php echo esc_attr( self::OPTIONS_KEY ); ?>[default_post_type]">
			<?php foreach ( $post_types as $post_type ) : ?>
				<option value="<?php echo esc_attr( $post_type->name ); ?>" <?php selected( $value, $post_type->name ); ?>><?php echo esc_html( $post_type->label ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	/**
	 * Render default author field.
	 *
	 * @since 1.0.0
	 */
	public function render_default_author_field() {
		$options = get_option( self::OPTIONS_KEY, array() );
		$value = $options['default_author'] ?? get_current_user_id();
		$users = get_users( array( 'who' => 'authors' ) );
		?>
		<select id="default_author" name="<?php echo esc_attr( self::OPTIONS_KEY ); ?>[default_author]">
			<?php foreach ( $users as $user ) : ?>
				<option value="<?php echo esc_attr( $user->ID ); ?>" <?php selected( $value, $user->ID ); ?>><?php echo esc_html( $user->display_name ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	/**
	 * Render log level field.
	 *
	 * @since 1.0.0
	 */
	public function render_log_level_field() {
		$options = get_option( self::OPTIONS_KEY, array() );
		$value = $options['log_level'] ?? 'errors';
		$levels = array(
			'errors' => __( 'Errors Only', 'auto-blogr' ),
			'all'    => __( 'All Actions', 'auto-blogr' ),
		);
		?>
		<select id="log_level" name="<?php echo esc_attr( self::OPTIONS_KEY ); ?>[log_level]">
			<?php foreach ( $levels as $level => $label ) : ?>
				<option value="<?php echo esc_attr( $level ); ?>" <?php selected( $value, $level ); ?>><?php echo esc_html( $label ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	/**
	 * Get plugin option value.
	 *
	 * @since 1.0.0
	 * @param string $key Option key.
	 * @param mixed  $default Default value.
	 * @return mixed Option value.
	 */
	public static function get_option( $key, $default = null ) {
		$options = get_option( self::OPTIONS_KEY, array() );
		return $options[ $key ] ?? $default;
	}

	/**
	 * Update plugin option value.
	 *
	 * @since 1.0.0
	 * @param string $key Option key.
	 * @param mixed  $value Option value.
	 * @return bool True on success, false on failure.
	 */
	public static function update_option( $key, $value ) {
		$options = get_option( self::OPTIONS_KEY, array() );
		$options[ $key ] = $value;
		return update_option( self::OPTIONS_KEY, $options );
	}
}
