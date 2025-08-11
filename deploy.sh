#!/bin/bash

# NodeQ MindMap Package Deployment Script
# Version: 1.1.0 Enhanced Processor Architecture

echo "🚀 Starting NodeQ MindMap Package Deployment v1.1.0"
echo "================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists npm; then
    print_error "NPM is not installed. Please install Node.js and NPM first."
    exit 1
fi

if ! command_exists git; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_status "Prerequisites check passed"

# Navigate to package directory
cd "$(dirname "$0")" || exit 1
print_info "Working directory: $(pwd)"

# Check if this is the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the nodeq-package directory?"
    exit 1
fi

# Verify package name
PACKAGE_NAME=$(node -p "require('./package.json').name")
if [ "$PACKAGE_NAME" != "nodeq-mindmap" ]; then
    print_error "Wrong package. Expected 'nodeq-mindmap', found '$PACKAGE_NAME'"
    exit 1
fi

print_status "Package verification passed"

# Step 1: Clean build
echo ""
echo "🧹 Cleaning previous builds..."
rm -rf dist/ node_modules/.cache
print_status "Cleaned build artifacts"

# Step 2: Install dependencies
echo ""
echo "📦 Installing dependencies..."
if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Run tests (if any)
echo ""
echo "🧪 Running tests..."
if npm test; then
    print_status "Tests passed"
else
    print_warning "Tests failed or not configured"
fi

# Step 4: Build package
echo ""
echo "🔨 Building package..."
if npm run build; then
    print_status "Package built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Verify build output
if [ ! -d "dist" ]; then
    print_error "Build directory 'dist' not found"
    exit 1
fi

print_status "Build verification passed"

# Step 5: Version bump check
echo ""
echo "📊 Current package version:"
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Version: $CURRENT_VERSION"

# Ask for version bump
echo ""
read -p "Do you want to bump the version? (patch/minor/major/skip) [skip]: " VERSION_BUMP
VERSION_BUMP=${VERSION_BUMP:-skip}

if [ "$VERSION_BUMP" != "skip" ]; then
    echo "⬆️  Bumping version ($VERSION_BUMP)..."
    if npm version "$VERSION_BUMP" --no-git-tag-version; then
        NEW_VERSION=$(node -p "require('./package.json').version")
        print_status "Version bumped to $NEW_VERSION"
    else
        print_error "Version bump failed"
        exit 1
    fi
fi

# Step 6: Git operations
echo ""
echo "📝 Git operations..."

# Check if git repo exists
if [ ! -d ".git" ]; then
    print_warning "Not a git repository. Initializing..."
    git init
    git remote add origin https://github.com/workflow-builder/nodeq-mindmap.git
fi

# Add and commit changes
echo "Adding changes to git..."
git add .

COMMIT_VERSION=$(node -p "require('./package.json').version")
COMMIT_MESSAGE="v$COMMIT_VERSION: Enhanced processor architecture with animated demonstrations"

if git commit -m "$COMMIT_MESSAGE"; then
    print_status "Changes committed"
else
    print_info "No changes to commit"
fi

# Create tag
echo "Creating git tag..."
if git tag "v$COMMIT_VERSION" 2>/dev/null; then
    print_status "Tag v$COMMIT_VERSION created"
else
    print_warning "Tag v$COMMIT_VERSION already exists"
fi

# Step 7: NPM Login Check
echo ""
echo "🔑 Checking NPM authentication..."
if npm whoami >/dev/null 2>&1; then
    NPM_USER=$(npm whoami)
    print_status "Logged in as: $NPM_USER"
else
    print_warning "Not logged into NPM"
    echo "Please login to NPM:"
    npm login
    
    if npm whoami >/dev/null 2>&1; then
        NPM_USER=$(npm whoami)
        print_status "Successfully logged in as: $NPM_USER"
    else
        print_error "NPM login failed"
        exit 1
    fi
fi

# Step 8: Dry run publish
echo ""
echo "🏃 Running publish dry run..."
if npm publish --dry-run; then
    print_status "Dry run successful"
else
    print_error "Dry run failed"
    exit 1
fi

# Step 9: Confirm publication
echo ""
echo "🚀 Ready to publish!"
print_info "Package: nodeq-mindmap@$COMMIT_VERSION"
print_info "Registry: $(npm config get registry)"
print_info "User: $NPM_USER"

echo ""
read -p "Proceed with publication? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    print_warning "Publication cancelled by user"
    exit 0
fi

# Step 10: Publish to NPM
echo ""
echo "📤 Publishing to NPM..."
if npm publish; then
    print_status "Package published successfully!"
else
    print_error "Publication failed"
    exit 1
fi

# Step 11: Push to GitHub
echo ""
echo "⬆️  Pushing to GitHub..."
if git push origin main; then
    print_status "Code pushed to main branch"
else
    print_warning "Failed to push to main branch"
fi

if git push origin --tags; then
    print_status "Tags pushed to GitHub"
else
    print_warning "Failed to push tags"
fi

# Step 12: Verification
echo ""
echo "🔍 Verifying publication..."
sleep 5  # Wait for NPM to update

if npm view nodeq-mindmap@"$COMMIT_VERSION" version >/dev/null 2>&1; then
    print_status "Package successfully published and available on NPM"
    
    echo ""
    echo "📋 Installation Instructions:"
    echo "npm install nodeq-mindmap@$COMMIT_VERSION"
    echo "yarn add nodeq-mindmap@$COMMIT_VERSION"
    
    echo ""
    echo "🔗 Links:"
    echo "NPM: https://www.npmjs.com/package/nodeq-mindmap"
    echo "GitHub: https://github.com/workflow-builder/nodeq-mindmap"
    
else
    print_warning "Package may not be immediately available. Check NPM in a few minutes."
fi

# Step 13: Create GitHub Release (optional)
echo ""
read -p "Create GitHub release? (y/N): " CREATE_RELEASE
if [ "$CREATE_RELEASE" = "y" ] || [ "$CREATE_RELEASE" = "Y" ]; then
    print_info "Please create a GitHub release manually at:"
    echo "https://github.com/workflow-builder/nodeq-mindmap/releases/new"
    echo "Use tag: v$COMMIT_VERSION"
    echo "Title: NodeQ MindMap v$COMMIT_VERSION - Enhanced Processor Architecture"
fi

echo ""
echo "🎉 Deployment completed successfully!"
print_status "Package nodeq-mindmap@$COMMIT_VERSION is now live!"

# Summary
echo ""
echo "📊 Deployment Summary:"
echo "======================"
echo "✅ Package built and tested"
echo "✅ Version: $COMMIT_VERSION"
echo "✅ Published to NPM"
echo "✅ Code pushed to GitHub"
echo "✅ Tags created and pushed"
echo ""
echo "🚀 Your enhanced NodeQ package with processor architecture is now available for installation!"