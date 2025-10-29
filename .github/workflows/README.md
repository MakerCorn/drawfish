# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the DrawFish project.

## Workflows Overview

### 1. Docker Build and Push ([docker-build.yml](docker-build.yml))

**Purpose**: Continuous integration for development branches

**Triggers**:

- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main` branch

**Jobs**:

1. **Lint and Validate**
   - Runs ESLint checks
   - Verifies code formatting with Prettier
   - Ensures code quality before building

2. **Build and Push Docker Image**
   - Builds multi-platform Docker images (amd64, arm64)
   - Pushes to GitHub Container Registry
   - Creates tags for branches and commits
   - Skips push on pull requests (only builds)

**Docker Tags Created**:

- `main` - Latest from main branch
- `develop` - Latest from develop branch
- `sha-<commit>` - Specific commit SHA
- `latest` - Latest from default branch (main)

**Example**: Push to main → builds `ghcr.io/makercorn/drawfish:main` and `latest`

---

### 2. Create Release ([release.yml](release.yml))

**Purpose**: Automated releases for version tags

**Triggers**:

- Push of version tags (e.g., `v1.0.0`, `v2.1.3`)

**Jobs**:

1. **Create GitHub Release**
   - Runs validation checks
   - Extracts version from tag
   - Extracts changelog for the version
   - Creates GitHub release with notes
   - Builds source code archive
   - Uploads release artifacts

2. **Build and Push Docker Image**
   - Builds multi-platform Docker images (amd64, arm64)
   - Pushes to GitHub Container Registry
   - Creates semantic version tags
   - Generates build provenance attestation

**Docker Tags Created**:

- `1.2.3` - Full version
- `1.2` - Major.minor version
- `1` - Major version only
- `sha-<commit>` - Commit SHA
- `latest` - Latest release

**Example**: Push tag `v1.2.3` → creates release + builds Docker images with all version tags

---

## Workflow Separation Strategy

The workflows are designed to avoid duplicate runs:

- **Branch pushes** trigger only `docker-build.yml`
- **Tag pushes** trigger only `release.yml`
- No overlap means no duplicate builds

### Why This Matters

Before the fix, both workflows triggered on tags, causing:

- Double builds for the same commit
- Wasted CI/CD minutes
- Confusion about which build is "official"

Now:

- ✅ Regular development → `docker-build.yml`
- ✅ Releases → `release.yml` (includes everything)
- ✅ No duplicate runs
- ✅ Clear separation of concerns

---

## Usage Examples

### Regular Development Workflow

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main
```

**Result**: Triggers `docker-build.yml`

- Runs linting
- Builds Docker image
- Tags: `main`, `latest`, `sha-abc123`

---

### Creating a Release

```bash
# Update version and changelog
vim package.json CHANGELOG.md

# Commit changes
git add .
git commit -m "chore: prepare release v1.2.0"
git push origin main

# Create and push tag
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

**Result**: Triggers `release.yml`

- Runs validation
- Creates GitHub release
- Builds Docker image
- Tags: `1.2.0`, `1.2`, `1`, `latest`, `sha-def456`

---

### Working on Feature Branch

```bash
# Create feature branch
git checkout -b feature/new-diagram-type
git push origin feature/new-diagram-type

# Create PR to main
```

**Result**: No automatic builds (feature branch not in trigger list)

When PR is created:

- Triggers `docker-build.yml` (PR trigger)
- Runs linting and validation
- Builds Docker image (doesn't push)
- Reports status on PR

---

## Customization

### Adding More Branches to CI

Edit `docker-build.yml`:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging # Add your branch
```

### Changing Docker Platforms

Edit the `platforms` in either workflow:

```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

### Adjusting Tag Strategy

Edit the `tags:` section in `docker/metadata-action`:

```yaml
tags: |
  type=semver,pattern={{version}}
  type=semver,pattern={{major}}.{{minor}}
  type=raw,value=edge,enable={{is_default_branch}}
```

---

## Permissions

Both workflows require these permissions:

- `contents: read/write` - Read code, create releases
- `packages: write` - Push to GitHub Container Registry
- `id-token: write` - Generate attestations

These are configured at the workflow level.

---

## Secrets and Variables

### Automatic Secrets (No Configuration Needed)

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `github.actor` - Current user/actor
- `github.repository` - Repository name

### Environment Variables

Defined in workflows:

- `REGISTRY: ghcr.io` - GitHub Container Registry
- `IMAGE_NAME: ${{ github.repository }}` - Full image name

---

## Monitoring and Debugging

### View Workflow Runs

- Go to: https://github.com/MakerCorn/drawfish/actions
- Click on a workflow run to see details
- Expand steps to see logs

### Common Issues

**Issue**: Build fails with "invalid tag format"

- Check tag patterns in metadata-action
- Ensure no dynamic values produce empty strings

**Issue**: Docker push fails with "unauthorized"

- Verify `packages: write` permission is set
- Check if GITHUB_TOKEN has proper scopes

**Issue**: Release not created

- Verify tag format matches `v*` pattern
- Check if changelog has section for the version

---

## Best Practices

1. **Always run validation locally** before pushing:

   ```bash
   npm run validate
   ```

2. **Use semantic versioning** for tags:
   - Major: Breaking changes (v2.0.0)
   - Minor: New features (v1.1.0)
   - Patch: Bug fixes (v1.0.1)

3. **Update CHANGELOG.md** before creating releases

4. **Test workflows** on feature branches with PRs

5. **Monitor Actions tab** for failures

---

## Cost Optimization

GitHub Actions provides free minutes for public repos. To optimize:

- ✅ Caching is enabled (`cache-from: type=gha`)
- ✅ Multi-stage Docker builds reduce build time
- ✅ Workflows only run when needed
- ✅ No duplicate builds

Private repos: 2,000 minutes/month free, then $0.008/minute

---

## Future Enhancements

Potential additions:

- [ ] Add automated testing job
- [ ] Add security scanning (Trivy, Snyk)
- [ ] Add code coverage reporting
- [ ] Add Dependabot auto-merge
- [ ] Add deployment to staging environment
- [ ] Add performance benchmarking

---

For more information, see:

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Metadata Action](https://github.com/docker/metadata-action)
