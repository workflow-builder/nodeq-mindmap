# NodeQ MindMap Package Deployment Guide

## 🚀 Step-by-Step NPM Package Update & Publishing

### Prerequisites
- Access to the GitHub repository: https://github.com/workflow-builder/nodeq-mindmap
- NPM account with publishing permissions for `nodeq-mindmap` package
- Git configured with your credentials

### 1. Version Update (Already Done ✅)
```bash
# Version bumped from 1.0.0 → 1.1.0 in package.json
# Repository URL updated to workflow-builder/nodeq-mindmap
```

### 2. Copy Enhanced Components
Copy these files from your current NODEQ project to the npm package:

```bash
# From your main project to nodeq-package/
cp client/src/components/ProcessorView.tsx nodeq-package/src/processor-view.ts
cp client/src/components/MindMapVisualization.tsx nodeq-package/src/mindmap-enhanced.ts
```

### 3. Update Package Source Files

**A. Update main index.ts:**
```typescript
// nodeq-package/src/index.ts
export * from './mindmap';
export * from './pipeline-engine';
export * from './processor-view';
export * from './types';

// Enhanced exports
export { ProcessorView, processorViewStyles } from './processor-view';
export { MindMapVisualization } from './mindmap-enhanced';
```

**B. Update package.json dependencies:**
```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.22.0", 
    "commander": "^14.0.0",
    "d3": "^7.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 4. Build & Test Locally

```bash
cd nodeq-package

# Install dependencies
npm install

# Build the package
npm run build

# Test the build
npm pack

# This creates nodeq-mindmap-1.1.0.tgz
# Test install: npm install ./nodeq-mindmap-1.1.0.tgz
```

### 5. Update Documentation

**A. Update README.md with new features:**
```markdown
## 🆕 New in v1.1.0
- ✨ Enhanced Processor View with animated architecture
- 🎯 Real-time data flow visualization
- 🧠 ML-powered pipeline demonstrations
- 📊 Interactive use case examples
- ⚡ Improved performance and animations
```

**B. Add new examples:**
```bash
# Create enhanced examples
echo 'processor-demo.html' >> examples/
```

### 6. Commit Changes to GitHub

```bash
# Add all changes
git add .

# Commit with version info
git commit -m "v1.1.0: Enhanced processor view with animated architecture and ML demonstrations"

# Tag the release
git tag v1.1.0

# Push to main branch
git push origin main

# Push tags
git push origin --tags
```

### 7. Publish to NPM

```bash
# Login to NPM (if not already logged in)
npm login

# Verify you're logged in as the correct user
npm whoami

# Publish the package
npm publish

# If you need to publish with specific access
npm publish --access public
```

### 8. Verify Publication

```bash
# Check the published package
npm view nodeq-mindmap

# Test installation from NPM
npm install nodeq-mindmap@1.1.0
```

### 9. Post-Publication Steps

**A. Update GitHub Release:**
1. Go to https://github.com/workflow-builder/nodeq-mindmap/releases
2. Click "Create a new release"
3. Use tag `v1.1.0`
4. Title: "NodeQ MindMap v1.1.0 - Enhanced Processor Architecture"
5. Add release notes with new features

**B. Update Documentation:**
```bash
# Update main README with installation instructions
npm install nodeq-mindmap@1.1.0
```

**C. Test the Published Package:**
```html
<!-- Create test HTML file -->
<!DOCTYPE html>
<html>
<head>
    <title>NodeQ Test</title>
    <script src="https://unpkg.com/nodeq-mindmap@1.1.0/dist/index.js"></script>
</head>
<body>
    <div id="mindmap"></div>
    <div id="processor"></div>
    <script>
        // Test the new processor view
        const processor = new NodeQMindMap.ProcessorView(
            document.getElementById('processor')
        );
        processor.startAnimation();
    </script>
</body>
</html>
```

## 🔍 Troubleshooting

### Common Issues:

1. **Build Errors:**
   ```bash
   # Clear cache and rebuild
   rm -rf dist/ node_modules/
   npm install
   npm run build
   ```

2. **Permission Errors:**
   ```bash
   # Check NPM permissions
   npm owner ls nodeq-mindmap
   npm owner add <username> nodeq-mindmap
   ```

3. **Version Conflicts:**
   ```bash
   # Force version update
   npm version 1.1.1 --force
   ```

## 📈 Success Indicators

✅ **Package built successfully** (dist/ folder created)  
✅ **Published to NPM** (visible at npmjs.com/package/nodeq-mindmap)  
✅ **GitHub tagged** (v1.1.0 tag exists)  
✅ **Installation works** (`npm install nodeq-mindmap@1.1.0`)  
✅ **New features accessible** (ProcessorView, animations working)  

## 🎯 Next Steps After Deployment

1. Update NODEQ main application to use published package
2. Create demo applications showcasing new features
3. Gather user feedback for v1.2.0 planning
4. Monitor download statistics and issues

---

**Ready to publish? Run these commands in sequence:**

```bash
cd nodeq-package
npm version 1.1.0
npm run build
git add . && git commit -m "v1.1.0: Enhanced processor architecture"
git tag v1.1.0 && git push origin main --tags
npm publish
```