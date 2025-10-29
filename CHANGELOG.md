# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MakerCorn/drawfish/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/MakerCorn/drawfish/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MakerCorn/drawfish/releases/tag/v1.0.0
