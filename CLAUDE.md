# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DrawFish is an AI-powered Mermaid diagram generator that converts natural language descriptions into visual diagrams using multiple LLM providers (Ollama, LM Studio, Azure OpenAI, AWS Bedrock, Google Vertex AI).

**Architecture**: Classic client-server split with vanilla JavaScript frontend and Node.js/Express backend. Stateless server design - all configuration sent per request from browser localStorage.

## Development Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start server with auto-reload (Node.js --watch)
npm start               # Start production server

# Code Quality (run before all commits)
npm run lint            # ESLint validation
npm run lint:fix        # Auto-fix ESLint issues
npm run format          # Format all code with Prettier
npm run format:check    # Check formatting without changes
npm run validate        # Run both lint + format:check

# Pre-commit validation
./scripts/pre-commit.sh # Full validation with colored output

# Docker
docker build -t drawfish .
docker run -p 3000:3000 -e OLLAMA_URL=http://host.docker.internal:11434 drawfish
```

**Server runs on**: `http://localhost:3000`

## Core Architecture Patterns

### Provider Pattern (Critical)

The provider pattern is the central architectural pattern. All AI integrations follow this interface:

```javascript
class ProviderInterface {
  constructor(config)                  // Validate & initialize with provider-specific config
  async generateDiagram(description)   // Main API - returns Promise<mermaidCode>
  buildPrompt(description)             // Format prompt for provider's API
  extractMermaidCode(response)         // Extract valid Mermaid from LLM response
}
```

**Factory Location**: `server/index.js` lines 26-45 (`getProvider()` function)

**Provider Categories**:

- **Local/REST-based**: Ollama, LM Studio (use axios HTTP client)
- **Cloud SDK-based**: Azure, Bedrock, Vertex (use official SDKs)

### Request Flow

```
Browser → POST /api/generate → getProvider(settings) → provider.generateDiagram() → Mermaid code → Browser
Browser → POST /api/export → Puppeteer headless browser → SVG/PNG/JPEG → Browser download
```

**Key Insight**: Settings travel FROM frontend localStorage TO backend per-request. No server-side session storage.

### Adding a New AI Provider

1. **Create provider file**: `server/providers/newprovider.js`
   - Implement the four methods (constructor, generateDiagram, buildPrompt, extractMermaidCode)
   - Constructor MUST validate required config fields and throw if missing
   - Use `extractMermaidCode()` to handle markdown wrappers and LLM preamble

2. **Update factory**: `server/index.js`
   - Import: `import { NewProvider } from './providers/newprovider.js';`
   - Add case: `case 'newprovider': return new NewProvider(config);`

3. **Update frontend UI**: `public/index.html`
   - Add `<option value="newprovider">` to provider dropdown
   - Add `<div id="newproviderConfig" class="provider-config">` with form fields

4. **Update frontend state**: `public/app.js`
   - Add to `currentSettings`: `newprovider: { url: '', model: '' }`
   - Add case in `populateProviderFields()` to read settings
   - Add case in `handleSaveSettings()` to save settings

**Critical**: The `extractMermaidCode()` method is identical across all providers because LLMs wrap output inconsistently. It removes markdown blocks and finds the first valid Mermaid diagram keyword.

## State Management

**Frontend**: `currentSettings` object in `app.js` (lines 6-12)

- Stored in: `localStorage.aiProviderSettings` (JSON)
- Loaded on startup via `loadSettings()`
- Updated via settings modal → `handleSaveSettings()` → `saveSettings()`

**Backend**: Receives complete settings per-request (stateless)

- Extract from POST body: `req.body.settings`
- Instantiate provider: `getProvider(settings)`
- No caching or persistence on server

## Mermaid Integration

**Frontend** (CDN-loaded):

```javascript
// Initialize once (app.js lines 1-6)
mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

// Render dynamically (app.js lines 124-144)
const { svg } = await mermaid.render(id, code);
diagramPreview.innerHTML = svg;
```

**Backend** (Puppeteer for exports):

```javascript
// HTML template with CDN Mermaid (server/index.js lines 85-111)
const html = `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
              <pre class="mermaid">${mermaidCode}</pre>
              <script>mermaid.initialize({ startOnLoad: true });</script>`;

// Wait for rendering before screenshot (server/index.js lines 119-144)
await page.waitForSelector('svg', { timeout: 10000 });
```

**Version Alignment**: Both use Mermaid v10 from same CDN to ensure consistency.

## Puppeteer Export Architecture

**Resource Management Pattern** (CRITICAL for production):

```javascript
const browser = await puppeteer.launch({ headless: true, args: [...] });
try {
  // Do work
} finally {
  await browser.close();  // MUST close in finally block
}
```

Not closing browsers causes "Target closed" errors after ~10 exports. Always use try/finally.

**Docker Optimization**: Uses system Chromium instead of bundled (~300MB savings):

```dockerfile
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

## Configuration & Environment

**Current State**: Environment variables are defined in `.env.example` but NOT used by the application. All configuration happens via UI → localStorage → request body.

**Design Gap**: To use `.env` variables, you'd need to:

1. Read `process.env.OLLAMA_BASE_URL` etc. in provider constructors
2. Fall back to config parameter if env var not set
3. Update frontend to allow override

## Error Propagation Chain

```
Provider Constructor Error (e.g., missing apiKey)
  ↓ throw Error
Server /api/generate catch block
  ↓ res.status(500).json({ error: message })
Frontend fetch() .then(res => res.json())
  ↓ if (!res.ok) throw new Error(data.error)
Frontend catch block
  ↓ alert(error.message)
```

All errors surface as alert() dialogs in browser. Provider-specific errors are abstracted.

## ESLint Configuration

**Version**: ESLint 9 (flat config format)

- **Config file**: `eslint.config.js` (NOT `.eslintrc.json`)
- **Important**: Uses ES modules (`export default [...]`)
- **Global**: `mermaid` declared as readonly (loaded from CDN)

**Validation Rules**:

- 2-space indentation (with `SwitchCase: 1`)
- Single quotes, semicolons required
- Unix line endings
- No trailing spaces

## Docker & CI/CD

**Multi-stage Dockerfile**:

- Stage 1: Install production dependencies only
- Stage 2: Alpine Linux + system Chromium + non-root user
- Health check: `GET /api/health` endpoint

**GitHub Actions Workflows**:

- `docker-build.yml`: Runs on push to main/develop (NOT on tags)
  - Validates with lint + format:check
  - Builds multi-platform (amd64, arm64)
  - Pushes to ghcr.io/makercorn/drawfish

- `release.yml`: Runs ONLY on version tags (v\*)
  - Creates GitHub release with CHANGELOG
  - Builds Docker images with version tags
  - Generates build provenance

**Tag Strategy** (from docker/metadata-action):

- `latest` - Latest main branch
- `1.1.0` - Full semantic version
- `1.1`, `1` - Major/minor versions
- `sha-<commit>` - Specific commit SHA
- `main`, `develop` - Branch names

**Creating a Release**:

```bash
# 1. Update version in package.json and CHANGELOG.md
# 2. Commit: git commit -m "chore: prepare release v1.2.0"
# 3. Tag: git tag -a v1.2.0 -m "Release version 1.2.0"
# 4. Push: git push origin main --tags
# GitHub Actions handles the rest
```

## API Endpoints

**POST /api/generate** (main feature):

- Request: `{ description: string, settings: { provider: string, [provider]: {...} } }`
- Response: `{ mermaidCode: string }` or `{ error: string }`
- Process: Instantiate provider → call generateDiagram() → return code

**POST /api/export** (Puppeteer):

- Request: `{ mermaidCode: string, format: "svg"|"png"|"jpeg" }`
- Response: Binary image data with Content-Type header
- Process: Wrap in HTML → Puppeteer → wait for SVG → screenshot/extract → stream

**GET /api/health**:

- Response: `{ status: "ok" }`
- Used by Docker HEALTHCHECK and Kubernetes liveness probes

## Provider-Specific Notes

**Azure OpenAI**: Uses `openai` npm package (not `@azure/openai`)

- Import: `import { AzureOpenAI } from 'openai';`
- API version: `2024-08-01-preview`
- Parameter: `max_tokens` (not `maxTokens`)

**Ollama**: Direct HTTP with axios to `/api/generate` endpoint

- Streaming disabled: `stream: false`
- Returns: `{ response: string }`

**Vertex AI**: Requires `GOOGLE_APPLICATION_CREDENTIALS` environment variable

- Points to service account JSON key file
- Used by SDK for authentication

**Bedrock**: AWS credentials from config or environment

- Supports both: explicit accessKey/secretKey OR AWS SDK default credential chain

## File Structure Essentials

```
server/
  index.js              # Express app, provider factory, API endpoints
  providers/
    *.js                # Provider implementations (5 files)

public/
  index.html            # SPA markup with settings modal
  app.js                # Frontend logic, state management, Mermaid rendering
  styles.css            # UI styling

.github/workflows/
  docker-build.yml      # CI for branches
  release.yml           # Release automation for tags
  README.md             # Workflow documentation

eslint.config.js        # ESLint 9 flat config
Dockerfile              # Multi-stage Alpine build
CHANGELOG.md            # Semantic versioning history
```

## Common Gotchas

1. **Settings not persisting**: Check browser localStorage. Settings are stored client-side only.

2. **Provider errors**: Constructor validation throws immediately. Check required fields match provider expectations.

3. **Mermaid rendering fails**: Syntax errors show in preview as red error message. Check diagram type keywords.

4. **Puppeteer "Target closed"**: Browser not closed properly. Always use try/finally pattern.

5. **Docker build fails**: Alpine packages may be missing. Chromium dependencies: `nss freetype harfbuzz ca-certificates`.

6. **ESLint errors after upgrade**: ESLint 9 requires flat config (`eslint.config.js`). Old `.eslintrc.*` files are ignored.

7. **GitHub Actions duplicate runs**: Ensure docker-build.yml doesn't trigger on tags (only release.yml should).

## Testing Locally

**No automated tests exist**. Manual testing workflow:

1. Start server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Configure provider in settings (⚙️ button)
4. Test generation with: "Create a flowchart showing user login process"
5. Test export: Click SVG/PNG/JPEG buttons
6. Verify settings persist after page refresh

**Provider Testing**: Requires actual API access/credentials for cloud providers. Local providers (Ollama, LM Studio) need services running.

## Dependencies to Watch

- **Mermaid**: Frontend uses CDN version. Backend Puppeteer uses same CDN. Keep versions aligned.
- **Puppeteer**: Breaking changes between major versions. Chromium binary compatibility critical for Docker.
- **Express**: v5.x is latest (breaking changes from v4). Uses modern promise-based middleware.
- **ESLint**: v9 flat config format incompatible with v8. Migration required updating config file.

## Security Considerations

- **Credentials in localStorage**: XSS-vulnerable. Users should use service accounts for cloud providers in production.
- **CORS enabled globally**: `app.use(cors())` allows all origins. Restrict in production if needed.
- **No rate limiting**: Consider adding rate limits on `/api/generate` for production deployments.
- **Docker non-root user**: Already implemented (user `nodejs` uid 1001).
- **Secrets in commits**: `.gitignore` excludes `.env` and `.claude/` settings.

## Documentation Files

- **README.md**: User-facing installation and usage guide
- **CONTRIBUTING.md**: Developer contribution guidelines (commit conventions, PR process)
- **SETUP_SUMMARY.md**: Implementation overview (infrastructure setup)
- **.github/workflows/README.md**: CI/CD workflow documentation
- **CHANGELOG.md**: Version history following Keep a Changelog format

## Version Strategy

Follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (e.g., remove provider, change API)
- **MINOR**: New features (e.g., add provider, new diagram type)
- **PATCH**: Bug fixes, dependency updates

Update `package.json` version and `CHANGELOG.md` before tagging releases.
