---
applyTo: "**"
---

1. Purpose of Agent Instructions
   Agent instructions (or “tool instructions”) provide the AI agent with:

Context & Scope: What the agent is building and why.

Constraints & Rules: Coding standards, security, performance, and architecture requirements.

Workflow Guidance: How to break down tasks, iterate, and verify outputs.

Clear agent instructions reduce ambiguity, prevent errors, and align the agent’s actions with project goals (cdn.openai.com).

2. Best Practices for Writing Agent Instructions
   Provide Comprehensive Background

Supply the full project spec (handoff doc) and coding rules (AGENTS.md) at the start.

Include environment, file structure, and dependencies. (augmentcode.com)

Be Explicit & Detailed

Specify every constraint: supported WP/PHP versions, namespace conventions, text domain, encryption methods.

Define file names, class names, and expected output formats.

Encourage Task Decomposition

Instruct the agent to break large features into smaller steps (scaffold → settings → REST → Cron → callbacks → dashboard → tests) (cdn.openai.com).

Enforce Coding Standards

State use of WordPress Coding Standards, PSR-4, inline documentation, and absence of TODO placeholders.

Iterative Development & Feedback

After each module, have the agent validate with tests or sample cURL commands before proceeding.

Security & Validation Emphasis

Reiterate sanitization/escaping rules, TLS enforcement, HMAC verification, and secure secret storage.

Specify Testing Requirements

Mandate PHPUnit tests, integration tests, code coverage targets, and static analysis via PHPStan.

CI/CD Integration

Define GitHub Actions workflow for linting, testing, and packaging. Provide example YAML entries.

Error Handling & Logging

Describe logging locations, log levels, retry strategies, admin notifications, and cleanup on uninstall.

End-of-Step Confirmation

Require the agent to summarize completed tasks and ask for any clarifications before advancing.

3. Domain Knowledge & Preferences
   Guide the agent with specific domain expertise and style preferences:

WordPress Domain Knowledge:

Deep understanding of WordPress plugin architecture, REST API, hooks & filters, security best practices, WP-Cron, and WP_List_Table.

Familiarity with WordPress data sanitization/escaping functions (wp_kses_post(), sanitize_text_field(), esc_url_raw()).

Awareness of capabilities and multisite nuances (get_blog_option(), update_blog_option()).

PHP & OOP Standards:

Adhere to WordPress Coding Standards for PHP, JavaScript, and CSS.

Use PSR-4 autoloading, namespaces, and object-oriented design patterns.

Include inline docblocks (/\*_ ... _/) and method-level comments for clarity.

Security Practices:

Enforce TLS verification on all external HTTP requests.

Implement HMAC signature checks and Application Password authentication.

Securely store and encrypt secrets using WP salts (AUTH_KEY, NONCE_SALT).

User Experience & UI Preferences:

Minimalist admin styling, ensuring compatibility with WordPress admin dark/light modes.

Clear real-time status feedback and error notifications.

Lightweight front-end assets (no heavy frameworks in assets/js/admin.js).

Testing & CI/CD Standards:

Write comprehensive PHPUnit tests and integration tests; target ≥80% code coverage.

Use GitHub Actions for linting (PHP_CodeSniffer), testing, and packaging releases.

4. Example Instruction Snippet
   "Using the handoff document and AGENTS.md as reference, generate auto-blogr.php with the plugin header, PSR-4 autoload, and activation/deactivation hooks. Follow WP coding standards and include inline comments. Once complete, run a syntax sanity check and confirm before proceeding to composer.json."

These guidelines ensure the AI agent produces consistent, secure, and maintainable code aligned with AutoBlogr’s requirements.
