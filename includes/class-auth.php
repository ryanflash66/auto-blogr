<?php
/**
 * Authentication handler class for AutoBlogr AI Publisher plugin.
 *
 * Handles Application Password authentication and HMAC signature verification.
 *
 * @package AutoBlogr
 * @since 1.0.0
 */

namespace AutoBlogr;

use WP_REST_Request;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Authentication handler class.
 *
 * @since 1.0.0
 */
class Auth {

	/**
	 * Check Application Password authentication.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error True if authenticated, WP_Error on failure.
	 */
	public static function check_application_password( $request ) {
		// Get authorization header.
		$auth_header = $request->get_header( 'authorization' );
		
		if ( empty( $auth_header ) ) {
			return new WP_Error(
				'no_auth_header',
				__( 'Authorization header is required.', 'auto-blogr' ),
				array( 'status' => 401 )
			);
		}

		// Extract username and password from Basic Auth.
		if ( 0 !== strpos( $auth_header, 'Basic ' ) ) {
			return new WP_Error(
				'invalid_auth_format',
				__( 'Invalid authorization format. Basic authentication required.', 'auto-blogr' ),
				array( 'status' => 401 )
			);
		}

		$credentials = base64_decode( substr( $auth_header, 6 ) );
		if ( false === $credentials || false === strpos( $credentials, ':' ) ) {
			return new WP_Error(
				'invalid_credentials_format',
				__( 'Invalid credentials format.', 'auto-blogr' ),
				array( 'status' => 401 )
			);
		}

		list( $username, $password ) = explode( ':', $credentials, 2 );

		// Authenticate using WordPress Application Passwords.
		$user = wp_authenticate_application_password( null, $username, $password );

		if ( is_wp_error( $user ) ) {
			return new WP_Error(
				'authentication_failed',
				__( 'Authentication failed. Invalid username or application password.', 'auto-blogr' ),
				array( 'status' => 401 )
			);
		}

		if ( ! $user || ! $user->exists() ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found or inactive.', 'auto-blogr' ),
				array( 'status' => 401 )
			);
		}

		// Check if user has permission to publish posts.
		if ( ! user_can( $user, 'publish_autoblogr_posts' ) ) {
			return new WP_Error(
				'insufficient_permissions',
				__( 'User does not have permission to publish AutoBlogr posts.', 'auto-blogr' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Verify HMAC signature.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error True if signature is valid, WP_Error on failure.
	 */
	public static function verify_hmac_signature( $request ) {
		// Get signature header.
		$signature_header = $request->get_header( 'X-AutoBlogr-Signature' );
		
		if ( empty( $signature_header ) ) {
			return new WP_Error(
				'missing_signature',
				__( 'X-AutoBlogr-Signature header is required.', 'auto-blogr' ),
				array( 'status' => 401 )
			);
		}

		// Get HMAC secret.
		$secret = self::get_hmac_secret();
		if ( is_wp_error( $secret ) ) {
			return $secret;
		}

		// Get request body.
		$body = $request->get_body();
		if ( empty( $body ) ) {
			return new WP_Error(
				'empty_request_body',
				__( 'Request body is required for signature verification.', 'auto-blogr' ),
				array( 'status' => 400 )
			);
		}

		// Calculate expected signature.
		$expected_signature = hash_hmac( 'sha256', $body, $secret );
		$expected_header = 'sha256=' . $expected_signature;

		// Compare signatures using hash_equals to prevent timing attacks.
		if ( ! hash_equals( $expected_header, $signature_header ) ) {
			return new WP_Error(
				'invalid_signature',
				__( 'Invalid HMAC signature.', 'auto-blogr' ),
				array( 'status' => 401 )
			);
		}

		return true;
	}

	/**
	 * Get or generate HMAC secret.
	 *
	 * @since 1.0.0
	 * @return string|WP_Error HMAC secret or error.
	 */
	private static function get_hmac_secret() {
		// Try to get existing secret.
		$encrypted_secret = get_option( Settings::HMAC_SECRET_KEY );
		
		if ( $encrypted_secret ) {
			$secret = self::decrypt_secret( $encrypted_secret );
			if ( ! is_wp_error( $secret ) ) {
				return $secret;
			}
		}

		// Generate new secret if none exists or decryption failed.
		$secret = wp_generate_password( 64, false );
		$encrypted_secret = self::encrypt_secret( $secret );
		
		if ( is_wp_error( $encrypted_secret ) ) {
			return $encrypted_secret;
		}

		update_option( Settings::HMAC_SECRET_KEY, $encrypted_secret );
		
		return $secret;
	}

	/**
	 * Encrypt secret using WordPress salts.
	 *
	 * @since 1.0.0
	 * @param string $secret Plain text secret.
	 * @return string|WP_Error Encrypted secret or error.
	 */
	private static function encrypt_secret( $secret ) {
		if ( ! defined( 'AUTH_KEY' ) || ! defined( 'NONCE_SALT' ) ) {
			return new WP_Error(
				'missing_wp_salts',
				__( 'WordPress security salts are not configured.', 'auto-blogr' ),
				array( 'status' => 500 )
			);
		}

		$key = hash( 'sha256', AUTH_KEY . NONCE_SALT );
		$iv = substr( hash( 'sha256', NONCE_SALT . AUTH_KEY ), 0, 16 );
		
		$encrypted = openssl_encrypt( $secret, 'AES-256-CBC', $key, 0, $iv );
		
		if ( false === $encrypted ) {
			return new WP_Error(
				'encryption_failed',
				__( 'Failed to encrypt HMAC secret.', 'auto-blogr' ),
				array( 'status' => 500 )
			);
		}

		return $encrypted;
	}

	/**
	 * Decrypt secret using WordPress salts.
	 *
	 * @since 1.0.0
	 * @param string $encrypted_secret Encrypted secret.
	 * @return string|WP_Error Decrypted secret or error.
	 */
	private static function decrypt_secret( $encrypted_secret ) {
		if ( ! defined( 'AUTH_KEY' ) || ! defined( 'NONCE_SALT' ) ) {
			return new WP_Error(
				'missing_wp_salts',
				__( 'WordPress security salts are not configured.', 'auto-blogr' ),
				array( 'status' => 500 )
			);
		}

		$key = hash( 'sha256', AUTH_KEY . NONCE_SALT );
		$iv = substr( hash( 'sha256', NONCE_SALT . AUTH_KEY ), 0, 16 );
		
		$decrypted = openssl_decrypt( $encrypted_secret, 'AES-256-CBC', $key, 0, $iv );
		
		if ( false === $decrypted ) {
			return new WP_Error(
				'decryption_failed',
				__( 'Failed to decrypt HMAC secret.', 'auto-blogr' ),
				array( 'status' => 500 )
			);
		}

		return $decrypted;
	}
}
