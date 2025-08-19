# AGENTS.md

**AI Coding Agent Rules for AutoBlogr AI Publisher Plugin**

1. **Goal & Scope**

   * Generate the complete Base44 AI Publisher WordPress plugin, from boilerplate to final build, without manual scaffolding.
   * Include all files, classes, functions, assets, and configuration as specified in the unified handoff document.

2. **File Structure & Boilerplate**

   * Reproduce the exact folder hierarchy:

     ```
     base44-ai-publisher/
     ├── README.md
     ├── base44-ai-publisher.php
     ├── uninstall.php
     ├── includes/
     │   ├── class-settings.php
     │   ├── class-rest-controller.php
     │   ├── class-cron-handler.php
     │   └── class-callback-handler.php
     ├── assets/
     │   ├── css/admin.css
     │   └── js/admin.js
     ├── languages/
     │   └── base44-ai-publisher.pot
     └── vendor/                        # Composer dependencies
     ```
   * Populate each file with appropriate header comments, PHP classes, methods, hooks, and namespaces (PSR-4).

3. **Coding Standards & Style**

   * Adhere strictly to WordPress Coding Standards (PHP, JS, CSS).
   * Use object-oriented PHP, PSR-4 autoloading for classes.
   * Wrap all translatable strings in `__()` or `_e()` with text domain `base44-ai-publisher`.

4. **Core Functionality Implementation**

   * **Settings Page**: Build `class-settings.php` to register plugin options and display the admin UI.
   * **REST Endpoints**: In `class-rest-controller.php`, register `/publish-post` route (v1 namespace), implement authentication (App Password + HMAC), input validation, and queueing via WP-Cron.
   * **Cron Handler**: `class-cron-handler.php` must dequeue tasks, download images via `media_handle_sideload()`, insert posts with `wp_insert_post()`, assign meta and taxonomies, and schedule status callbacks.
   * **Callback Logic**: `class-callback-handler.php` must send initial and final status updates to Base44 using `wp_remote_post()`, handle retries, and log failures.

5. **Security & Validation**

   * Enforce SSL for all external requests.
   * Sanitize all inputs per spec (`wp_kses_post()`, `sanitize_text_field()`, `esc_url_raw()`).
   * Implement HMAC signature verification using a shared secret stored encrypted in `wp_options`.

6. **Async Workflow & Reliability**

   * Return HTTP 202 on publish endpoint, schedule a WP-Cron job immediately.
   * Implement exponential backoff retries for media download and callbacks.
   * Log all actions to a custom log file and optionally to `error_log()`.

7. **Admin Dashboard**

   * Use `WP_List_Table` in a top-level admin menu (`Base44 Posts`) to list and manage AI-published posts.
   * Implement filters, bulk actions (retry, view/edit), and pagination as specified.

8. **Testing**

   * Include PHPUnit tests covering REST routes, sanitization, post creation, Cron scheduling, and callback retries.
   * Provide a `phpunit.xml` configuration and instructions for running tests in CI.

9. **CI/CD & Deployment**

   * Generate a `composer.json` for dependencies and PSR-4 autoload.
   * Include GitHub Actions YAML for linting (PHP\_CodeSniffer), running tests, building a deployable ZIP.

10. **Documentation & Localization**

    * Populate `README.md` (readme.txt format) with installation, usage, FAQs, and upgrade notes.
    * Generate a `.pot` file for translation in `/languages`.

**Agent Instructions:**

* Produce complete, ready-to-install plugin code.
* Do not leave any `TODO` placeholders.
* Ensure code compiles without errors.
* Confirm directory and file names match exactly.
* Provide inline comments for complex logic.

*This AGENTS.md file defines the rules and expectations for an AI coding agent tasked with generating the entire Base44 AI Publisher plugin from scratch.*