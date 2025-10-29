# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-10-29

### Added

- CLAUDE.md: Comprehensive guide for future Claude Code instances
  - Development commands and workflow documentation
  - Core architecture patterns (Provider pattern implementation)
  - Step-by-step guide for adding new AI providers
  - Mermaid integration details (frontend and backend)
  - Puppeteer export architecture and resource management
  - Common gotchas and troubleshooting guide
- GitHub Actions attestation permissions for build provenance
- Workflows documentation in .github/workflows/README.md

### Changed

- Updated all dependencies to latest versions
  - ESLint 8.57.0 → 9.38.0 (migrated to flat config)
  - Puppeteer 21.6.0 → 24.26.1 (security fixes)
  - Express 4.18.2 → 5.1.0 (major version)
  - Dotenv 16.3.1 → 17.2.3
  - Prettier 3.2.5 → 3.6.2
  - Axios 1.6.2 → 1.13.1
- Migrated from .eslintrc.json to eslint.config.js (ESLint 9 flat config)
- Azure OpenAI integration now uses openai package instead of @azure/openai
- Moved SETUP_SUMMARY.md to docs/ directory for better organization
- Fixed Docker image URLs in documentation (yourusername → makercorn)
- Separated GitHub Actions workflows to prevent duplicate runs
  - docker-build.yml: Only triggers on branch pushes
  - release.yml: Only triggers on version tags (includes Docker build)

### Fixed

- GitHub Actions workflow duplicate runs on tag pushes
- Docker tag generation with invalid format (empty branch prefix)
- GitHub Actions attestation step failures (added continue-on-error)
- All 5 high severity security vulnerabilities via Puppeteer update
  - tar-fs path traversal vulnerabilities (3 CVEs)
  - ws DoS vulnerability (CVE-2024-37890)

### Security

- Resolved all npm audit vulnerabilities (0 vulnerabilities)
- Updated Puppeteer to patch tar-fs and ws security issues
- Added attestations permission to GitHub Actions workflows

### Documentation

- Added comprehensive CLAUDE.md for future development
- Updated README.md with correct Docker image registry URLs
- Fixed repository URLs in CONTRIBUTING.md
- Added detailed workflow documentation in .github/workflows/README.md
- Updated all documentation to reference ghcr.io/makercorn/drawfish

## [1.1.0] - 2025-10-29

### Added

- ESLint configuration for code quality checks
- Prettier configuration for consistent code formatting
- npm scripts for linting and validation (lint, lint:fix, format, format:check, validate)
- Docker support with multi-stage builds
- Dockerfile with Alpine Linux, Chromium for Puppeteer, and non-root user
- .dockerignore for optimized builds
- GitHub Actions workflow for automated Docker image builds (multi-platform)
- GitHub Actions workflow for automated releases
- Pre-commit validation script (scripts/pre-commit.sh)
- CHANGELOG.md for tracking changes (Keep a Changelog format)
- CONTRIBUTING.md with development guidelines
- SETUP_SUMMARY.md with implementation documentation
- Health check in Docker container

### Changed

- Formatted all code with Prettier
- Fixed all ESLint errors across codebase
- Updated README.md with Docker, CI/CD, and development documentation
- Renamed package to "drawfish" in package.json

### Fixed

- Docker tag generation in GitHub Actions workflow (invalid tag format on version tags)

### Security

- Non-root Docker user for improved container security
- Build provenance attestation in CI/CD

## [1.0.0] - 2025-10-29

### Added

- Initial release of DrawFish
- AI-powered Mermaid diagram generation from natural language
- Support for multiple AI providers:
  - Ollama (local)
  - LM Studio (local)
  - Azure OpenAI
  - AWS Bedrock (Claude, Titan)
  - Google Vertex AI (Gemini)
- Web-based UI with live diagram preview
- Diagram export to SVG, PNG, and JPEG formats
- Configurable provider settings via UI and environment variables
- Support for 11 Mermaid diagram types:
  - Flowchart
  - Sequence Diagram
  - Class Diagram
  - State Diagram
  - Entity Relationship Diagram
  - User Journey
  - Gantt Chart
  - Pie Chart
  - Git Graph
  - Mindmap
  - Timeline
- Express.js REST API backend
- Puppeteer-based diagram rendering engine
- Responsive web interface

### Security

- CORS protection
- Environment variable configuration
- No credentials stored in code

[Unreleased]: https://github.com/MakerCorn/drawfish/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/MakerCorn/drawfish/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MakerCorn/drawfish/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MakerCorn/drawfish/releases/tag/v1.0.0
