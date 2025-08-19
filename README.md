# AutoBlogr AI Publisher Plugin

AutoBlogr is a WordPress plugin that enables secure, automated publishing of AI-generated blog posts via REST API. It is designed for modern WordPress environments, following strict coding, security, and testing standards.

## Features
- REST API endpoint for publishing posts
- Application Password authentication
- HMAC signature verification
- Secure secret storage using WP salts
- Asynchronous post processing via WP-Cron
- Real-time status callbacks
- Minimalist admin UI (dark/light mode compatible)
- Comprehensive logging and error handling
- Multisite compatible
- PSR-4 autoloading and OOP architecture
- Extensive sanitization and escaping
- PHPUnit and integration tests (≥80% coverage)
- GitHub Actions for CI/CD, linting, and packaging

## Requirements
- WordPress 6.0+
- PHP 8.0+
- Composer

## Installation
1. Clone the repo or download the ZIP
2. Run `composer install`
3. Activate the plugin in WordPress admin

## Usage
- Use the `/autoblogr/v1/publish-post` REST endpoint to publish posts
- Authenticate using Application Passwords
- Sign requests with HMAC using your callback API key

## Security
- All external requests enforce TLS
- Secrets are encrypted with WP salts
- All data is sanitized and escaped

## Testing
- Run `vendor/bin/phpunit` for unit tests
- Code coverage ≥80%
- Static analysis via PHPStan

## Contributing
Pull requests and issues are welcome. Please follow WordPress and PSR-4 coding standards.

## License
GPLv2 or later

## Author
Ryan F. | vibeCoded

---
For full specs and coding rules, see `AGENTS.md` and the handoff document.
