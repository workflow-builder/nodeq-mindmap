# 🚀 Quick Deploy Guide for NodeQ Package

## One-Command Deployment

```bash
cd nodeq-package && ./deploy.sh
```

## What the Script Does

1. **Prerequisites Check** - Verifies npm and git are installed
2. **Clean Build** - Removes old build artifacts
3. **Install Dependencies** - Fresh npm install
4. **Build Package** - Compiles TypeScript and creates dist/
5. **Version Management** - Optional version bump (patch/minor/major)
6. **Git Operations** - Commits, tags, and pushes to GitHub
7. **NPM Authentication** - Checks/prompts for NPM login
8. **Publish** - Dry run then real publish to NPM
9. **Verification** - Confirms package is live on NPM

## Prerequisites

- Node.js and NPM installed
- Git configured with your credentials
- NPM account with permissions for `nodeq-mindmap` package
- GitHub access to `workflow-builder/nodeq-mindmap` repository

## Manual Steps (Alternative)

If you prefer manual deployment:

```bash
# 1. Build the package
cd nodeq-package
npm install
npm run build

# 2. Version bump (optional)
npm version patch  # or minor/major

# 3. Git operations
git add .
git commit -m "v1.1.0: Enhanced processor architecture"
git tag v1.1.0
git push origin main --tags

# 4. Publish to NPM
npm login  # if not already logged in
npm publish

# 5. Verify
npm view nodeq-mindmap
```

## New Features in v1.1.0

✨ **Enhanced Processor View**
- Animated architecture demonstration
- Real-time data flow visualization  
- Interactive use case examples
- ML-powered pipeline showcases

✨ **Improved Animations**
- Flowing connection lines
- Data packet movement
- Component pulsing effects
- Processing status indicators

✨ **Better Documentation**
- Step-by-step installation guide
- Usage examples for new features
- Architecture diagrams
- Performance metrics display

## Post-Deployment

After successful deployment:

1. **Test Installation**:
   ```bash
   npm install nodeq-mindmap@1.1.0
   ```

2. **Update Main App** (if applicable):
   ```bash
   # In your main NODEQ project
   npm update nodeq-mindmap
   ```

3. **Create GitHub Release**:
   - Go to: https://github.com/workflow-builder/nodeq-mindmap/releases
   - Create new release with tag `v1.1.0`
   - Add release notes with new features

4. **Verify Package**:
   - Check NPM: https://www.npmjs.com/package/nodeq-mindmap
   - Test installation in a fresh project
   - Confirm new ProcessorView component works

## Troubleshooting

**Build Errors**:
```bash
rm -rf dist/ node_modules/
npm install
npm run build
```

**Permission Errors**:
```bash
npm owner ls nodeq-mindmap
npm login
```

**Git Issues**:
```bash
git remote -v  # Check remote URL
git push origin main --force-with-lease  # If needed
```

---

**Ready to deploy? Run:**
```bash
./deploy.sh
```