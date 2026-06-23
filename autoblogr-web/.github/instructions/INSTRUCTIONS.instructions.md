---
applyTo: "**"
---

# AutoBlogr Project Instructions for GitHub Copilot

This file provides comprehensive instructions for GitHub Copilot when working on the AutoBlogr project - an AI-powered blog content creation and management platform.

## Project Overview

AutoBlogr is a React-based web application that helps users create, manage, and publish blog content using AI assistance. The application integrates with WordPress for publishing and uses various AI services for content generation.

### Project Context

- **Domain**: Content creation and blog management SaaS
- **Target Users**: Content creators, marketers, businesses, agencies
- **Core Value Proposition**: AI-powered content generation with WordPress integration
- **Business Model**: Freemium SaaS with usage-based AI pricing

## Technology Stack

- **Frontend**: React 18.2.0 with Vite 4.5.0
- **Styling**: TailwindCSS with Shadcn/UI components
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Authentication**: Clerk (to be implemented)
- **Backend**: Supabase (to be implemented)
- **AI Integration**: OpenRouter + Hugging Face fallback

## AI Development Guidelines

### AI Code Generation Principles

- **Manual Review Required**: All AI-generated code must undergo human review before deployment
- **Test Coverage Mandatory**: Every AI-generated function requires corresponding tests
- **Security First**: AI code must be audited for vulnerabilities, especially API integrations
- **Performance Monitoring**: Track AI code performance impact on application metrics
- **Documentation Required**: Document AI-generated components and their intended behavior

### AI Usage Restrictions

- **Never expose API keys** in client-side code - use environment variables
- **Never trust AI suggestions blindly** - validate all external library recommendations
- **Always sanitize AI-generated content** before displaying to users
- **Implement fallback strategies** for all AI-dependent features
- **Log AI decisions** and track usage for debugging and optimization

### Quality Assurance for AI Code

1. **Cross-validation**: Use multiple approaches for critical functionality
2. **Edge case testing**: AI often misses edge cases - test thoroughly
3. **Security review**: Audit for injection vulnerabilities and data exposure
4. **Performance testing**: Ensure AI code doesn't degrade application performance
5. **Rollback procedures**: Always have a way to disable AI features if they fail

## Code Style Guidelines

### File Naming Conventions

- **React Components**: PascalCase (e.g., `BlogIdea.jsx`, `UserProfile.jsx`)
- **Directories**: lowercase (e.g., `components`, `pages`, `utils`)
- **Files**: camelCase for utilities, PascalCase for components
- **Constants**: UPPER_SNAKE_CASE

### Import Organization

### Component Structure Standard

## Architecture Patterns

### Entity-Driven Architecture

- All data operations go through Entity classes
- Entities handle validation, persistence, and business logic
- UI components only handle presentation logic
- Clear separation between data layer and presentation layer

### Error Handling Strategy

### AI Integration Pattern

## Component Guidelines

### UI Components (Shadcn/UI)

- **Always use existing components** from `@/components/ui/` before creating new ones
- **Follow established patterns** for consistency across the application
- **Implement proper loading states** for all async operations
- **Provide clear error messages** with actionable next steps
- **Ensure mobile responsiveness** with Tailwind's responsive utilities

### Form Handling Standards

### State Management Principles

- **Keep state local** when possible - avoid unnecessary global state
- **Use Entity classes** for data persistence and business logic
- **Implement optimistic updates** for better user experience
- **Handle loading and error states** consistently across components

## Security Guidelines

### Data Handling Security

- **Sanitize all user inputs** before processing or storing
- **Validate data types** and ranges for all inputs
- **Use environment variables** for all sensitive configuration
- **Implement proper authentication** checks on all protected routes
- **Never log sensitive data** (passwords, API keys, personal information)

### AI Integration Security

### API Security

- **Rate limit** all external API calls
- **Implement timeouts** for all network requests
- **Validate responses** from external services
- **Use HTTPS** for all external communications
- **Store credentials securely** using proper encryption

## Performance Guidelines

### React Optimization

### Bundle Optimization

- **Import only what you need** from large libraries
- **Use dynamic imports** for large components or routes
- **Optimize images** using proper formats and sizes
- **Monitor bundle size** and investigate large dependencies

### AI Performance

- **Cache AI responses** when appropriate
- **Implement request queuing** to avoid overwhelming AI services
- **Use appropriate models** for each task (cheaper models for simple tasks)
- **Monitor AI usage costs** and implement usage limits

## Testing Standards

### Component Testing Requirements

### Integration Testing

- **Test Entity CRUD operations** with mock data
- **Test AI integration flows** with mocked responses
- **Test form submissions** end-to-end
- **Test error handling** for network failures

## Error Handling & Logging

### Error Boundary Implementation

### Logging Standards

- **Log all errors** with context and stack traces
- **Track user actions** for debugging purposes
- **Monitor performance metrics** (load times, AI response times)
- **Never log sensitive data** (passwords, tokens, personal info)

## Documentation Requirements

### Code Documentation

- **Document complex business logic** with inline comments
- **Explain non-obvious implementation decisions**
- **Document AI integration patterns** and fallback strategies
- **Keep documentation up-to-date** with code changes

### Component Documentation

## 🔖 Changelog Policy (MANDATORY)

**Treat `CHANGELOG.md` as the single source of truth for project history.**  
It is the project’s memory: **what changed, why it changed, and the impact**—without digging through commit diffs.

### Your responsibilities (every time you work on the repo)

1. **Before** making changes:

   - Read `CHANGELOG.md` (especially the **Unreleased** section) to understand context, pending items, and known pitfalls.

2. **After** making changes (code, config, docs, CI, data):
   - Add or update an entry under **Unreleased** describing the change.
   - Use action-oriented language: _what changed + why/impact_ (1–2 lines).
   - Cross-reference issues/PRs (e.g., `#123`) when available.

### Structure & conventions

- Follow **Keep a Changelog** and **Semantic Versioning**.
- Sections per version (use any that apply):  
  **Added • Changed • Fixed • Removed • Deprecated • Security • Docs • Build/CI**
- Reverse chronological order (newest first).
- Keep lines human-readable (~100 chars); avoid internal jargon.

### Categorization guide

- **Added**: new endpoints, features, CLI commands.
- **Changed**: behavior changes, defaults, refactors with user-visible impact.
- **Fixed**: bug fixes, regressions, edge cases.
- **Removed**: deprecated code actually deleted, legacy flags removed.
- **Deprecated**: features flagged for removal in a future release.
- **Security**: auth/hardening, secrets handling, permission scope changes.
- **Docs**: README/RUNBOOK updates, examples, diagrams.
- **Build/CI**: workflows, tooling, packaging, linters.

### Release workflow

- When preparing a release:
  - Move **Unreleased** items into a new version section, e.g. `## [1.0.1] - 2025-08-23`.
  - Summarize the theme of the release in 1–2 sentences.
  - Leave **Unreleased** ready for the next cycle.

### Good entry examples

- **Added**: “Added `/v1/publish-post` HMAC toggle for local testing (#214).”
- **Fixed**: “Fixed cron reschedule bug causing duplicate callbacks; added idempotency guard (#231).”
- **Security**: “Encrypted HMAC secret at rest using WP salts; rotated legacy key path (#240).”
- **Docs**: “Expanded RUNBOOK with callback troubleshooting flow and curl recipes (#245).”

### Anti-patterns (avoid)

- Vague notes like “misc updates” or “fixes.”
- Duplicating commit logs verbatim.
- Omitting the “why/impact.”

### Acceptance criteria

- After your work, **Unreleased** reflects the actual changes.
- Entries are categorized, concise, and reference issues/PRs when relevant.
- For releases, **Unreleased** is cleanly rolled into a new version section.

> **Rule of thumb:** If it’s worth changing, it’s worth one clear line in the changelog.

## AutoBlogr-Specific Business Logic

### Blog Ideas Management

- **Status Flow**: draft → ready → generating → generated → published
- **AI Enhancement**: Automatically improve titles and descriptions
- **SEO Optimization**: Generate keywords and meta descriptions
- **Content Planning**: Track idea relationships and content calendars

### Post Generation Workflow

### WordPress Integration

- **Authentication**: Support both username/password and OAuth
- **Publishing Flow**: Draft → Review → Publish with user confirmation
- **Media Handling**: Upload images to WordPress media library
- **Error Recovery**: Handle WordPress API failures gracefully

## Development Workflow

### AI-Assisted Development Process

1. **Define requirements** clearly before asking AI for code
2. **Review AI suggestions** against project standards
3. **Test AI-generated code** thoroughly
4. **Document AI decisions** and reasoning
5. **Monitor AI code performance** in production

### Code Review Checklist for AI Code

- [ ] **Follows project coding standards** and patterns
- [ ] **Implements proper error handling** and user feedback
- [ ] **Includes appropriate tests** for functionality
- [ ] **Handles edge cases** and invalid inputs
- [ ] **Maintains security standards** (no exposed secrets)
- [ ] **Optimizes performance** (no unnecessary re-renders)
- [ ] **Provides accessibility** features where needed
- [ ] **Documents complex logic** and decisions
- [ ] **Updates `CHANGELOG.md`** (**Unreleased** section) with what/why/impact and references

## Deployment & Monitoring

### Production Readiness

- **Environment configuration** properly set up
- **Error monitoring** (Sentry) configured
- **Performance monitoring** active
- **Security headers** implemented
- **HTTPS enforcement** enabled

### AI Service Monitoring

- **Track usage costs** and implement budget alerts
- **Monitor response times** and error rates
- **Implement circuit breakers** for failing services
- **Log AI interactions** for debugging and improvement

---

Remember: This is a business application where reliability, security, and user experience are paramount. Every piece of AI-generated code should enhance these qualities, not compromise them. When in doubt, prioritize user safety and data security over feature velocity.
