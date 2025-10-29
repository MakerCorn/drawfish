# Contributing to DrawFish

Thank you for your interest in contributing to DrawFish! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/drawfish.git
cd drawfish
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and configure:

```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

4. Start the development server:

```bash
npm run dev
```

## Code Quality

### Linting

We use ESLint to maintain code quality. Run linting with:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Code Formatting

We use Prettier for consistent code formatting:

```bash
# Check formatting
npm run format:check

# Auto-format code
npm run format
```

### Validation

Before committing, run the full validation:

```bash
npm run validate
```

This runs both ESLint and Prettier checks.

## Pre-Commit Validation

We provide a pre-commit script that ensures code quality. You can run it manually:

```bash
./scripts/pre-commit.sh
```

Or set it up as a git hook:

```bash
ln -s ../../scripts/pre-commit.sh .git/hooks/pre-commit
```

## Commit Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(providers): add support for Claude 3 Opus
fix(export): resolve SVG export transparency issue
docs(readme): update installation instructions
```

### Before Committing

1. Run validation: `npm run validate`
2. Test your changes manually
3. Update CHANGELOG.md if needed
4. Write clear commit messages

## Pull Request Process

1. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:

```bash
git add .
git commit -m "feat: add your feature"
```

3. Push to your fork:

```bash
git push origin feature/your-feature-name
```

4. Open a Pull Request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots (if UI changes)
   - Test results

## Project Structure

```
drawfish/
├── public/              # Frontend files
│   ├── index.html      # Main HTML page
│   ├── app.js          # Frontend JavaScript
│   └── styles.css      # Styling
├── server/             # Backend files
│   ├── index.js        # Express server
│   └── providers/      # AI provider implementations
├── scripts/            # Utility scripts
├── .github/            # GitHub Actions workflows
└── Dockerfile          # Docker configuration
```

## Adding a New AI Provider

1. Create a new file in `server/providers/`:

```javascript
export class YourProvider {
  constructor(config) {
    this.config = config;
  }

  async generateDiagram(description) {
    // Implementation
  }

  buildPrompt(description) {
    // Build prompt for the AI
  }

  extractMermaidCode(response) {
    // Extract Mermaid code from response
  }
}
```

2. Update `server/index.js` to include your provider
3. Add configuration to `.env.example`
4. Update documentation

## Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are welcome!

### Manual Testing Checklist

- [ ] Test with all supported AI providers
- [ ] Test all diagram types
- [ ] Test export to SVG, PNG, and JPEG
- [ ] Test error handling
- [ ] Test with different browsers
- [ ] Verify mobile responsiveness

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

Update version in:

- `package.json`
- `CHANGELOG.md`

## Release Process

Releases are automated via GitHub Actions:

1. Update CHANGELOG.md with release notes
2. Commit changes
3. Create and push a version tag:

```bash
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

4. GitHub Actions will:
   - Run validation
   - Build Docker image
   - Create GitHub release
   - Publish to GitHub Container Registry

## Docker Development

Build and run locally:

```bash
# Build image
docker build -t drawfish:dev .

# Run container
docker run -p 3000:3000 \
  -e OLLAMA_URL=http://host.docker.internal:11434 \
  drawfish:dev
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues and pull requests
- Read the [README.md](README.md) for usage instructions

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a positive community

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
