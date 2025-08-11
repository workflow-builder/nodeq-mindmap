# Changelog - NodeQ MindMap Package

## [2.0.0] - 2025-08-11

### 🚀 Major Features Added
- **Enhanced Pipeline Engine**: ML-powered data transformation with TensorFlow.js integration
- **CLI Support**: Command-line interface with headless DOM rendering using JSDOM
- **Advanced JSON Schema Adapter**: Improved conversion logic with better field detection
- **Interactive Mind Maps**: Enhanced collapse/expand functionality with `_expanded` flags
- **Theme System**: Dynamic theme updates with smooth transitions

### ✨ New Capabilities
- **Headless Rendering**: CLI SVG generation without browser environment
- **Pipeline Management**: Create, update, and execute data transformation pipelines
- **ML Model Integration**: TensorFlow.js model loading with fallback to rule-based engine
- **Advanced Field Mapping**: Intelligent source-to-target field mapping with confidence scores
- **Data Source Integration**: Support for API, database, and file-based data sources

### 🔧 Technical Improvements
- **TypeScript Enhancements**: Better type definitions and inference
- **Error Handling**: Comprehensive error catching and graceful fallbacks
- **Performance Optimization**: Improved rendering and data processing efficiency
- **Module System**: Support for CommonJS, ES Modules, and UMD formats
- **DOM Utilities**: Safe DOM manipulation for CLI and browser environments

### 📦 Dependencies Updated
- Added `@tensorflow/tfjs` for ML-powered transformations
- Added `jsdom` for headless DOM operations
- Added `commander` for enhanced CLI interface
- Updated build system for multi-format distribution

### 🐛 Bug Fixes
- Fixed theme property null/undefined handling
- Resolved CLI shebang placement issues
- Improved error messages and validation
- Better handling of edge cases in JSON conversion

### 🔄 Breaking Changes
- Updated to version 2.0.0 with enhanced API surface
- Enhanced NodeQConfig interface with pipeline callbacks
- Improved JsonSchemaAdapter with more sophisticated conversion logic

### 📊 Package Stats
- **Size**: 21.0 kB compressed, 88.0 kB unpacked
- **Files**: 18 total (including models directory)
- **Formats**: CommonJS, ES Modules, UMD with TypeScript definitions
- **CLI Commands**: generate, create-pipeline, execute-pipeline, update-input, update-output

---

## [1.1.0] - Previous Version
- Basic mind map visualization
- Simple JSON schema conversion
- Core D3.js integration
- TypeScript support

---

**Repository**: https://github.com/jayresearcher/NODEQ  
**License**: MIT  
**Author**: NODEQ Team