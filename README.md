# NODEQ MindMap 🧠

[![npm version](https://badge.fury.io/js/nodeq-mindmap.svg)](https://badge.fury.io/js/nodeq-mindmap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, interactive mind map visualization library that transforms JSON data into beautiful, interactive mind maps. Perfect for career planning, organizational charts, knowledge mapping, and any hierarchical data visualization.

## 🚀 Features

- **Universal JSON Support**: Automatically converts any reasonable JSON structure to mind maps
- **Interactive Navigation**: Click to expand/collapse nodes, zoom, pan, and explore
- **Responsive Design**: Works on desktop, tablet, and mobile devices  
- **Customizable Styling**: Full control over colors, fonts, and animations
- **TypeScript Support**: Built with TypeScript for better developer experience
- **Lightweight**: Minimal dependencies, optimized for performance
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript

## 📦 Installation

```bash
npm install nodeq-mindmap
```

```bash
yarn add nodeq-mindmap
```

## 🎯 Quick Start

### Basic Usage

```javascript
import { NodeQMindMap } from 'nodeq-mindmap';

// Your JSON data
const data = {
  "topic": "My Project",
  "summary": "Project overview",
  "children": [
    {
      "topic": "Frontend",
      "skills": ["React", "TypeScript", "CSS"],
      "children": [
        {
          "topic": "Components",
          "summary": "Reusable UI components"
        }
      ]
    },
    {
      "topic": "Backend", 
      "skills": ["Node.js", "Express", "PostgreSQL"]
    }
  ]
};

// Create mind map
const mindMap = new NodeQMindMap({
  container: '#mindmap-container',
  data: data,
  width: 800,
  height: 600
});

// Render the mind map
mindMap.render();
```

### HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>NodeQ MindMap Example</title>
</head>
<body>
  <div id="mindmap-container"></div>
  <script src="your-script.js"></script>
</body>
</html>
```

## 🔧 Configuration Options

```javascript
const config = {
  container: '#mindmap-container',    // CSS selector for container
  data: jsonData,                     // Your JSON data
  width: 800,                         // Canvas width
  height: 600,                        // Canvas height
  
  // Styling options
  theme: {
    nodeColor: '#4299e1',            // Default node color
    textColor: '#2d3748',            // Text color
    linkColor: '#a0aec0',            // Connection line color
    backgroundColor: '#ffffff',       // Background color
    fontSize: 14,                     // Font size
    fontFamily: 'Arial, sans-serif'   // Font family
  },
  
  // Behavior options
  interactive: true,                  // Enable click interactions
  zoomable: true,                    // Enable zoom/pan
  collapsible: true,                 // Enable node collapse
  
  // Layout options
  nodeSpacing: 200,                  // Space between nodes
  levelSpacing: 300,                 // Space between levels
  
  // Callbacks
  onNodeClick: (node) => {           // Node click handler
    console.log('Clicked node:', node);
  },
  onNodeHover: (node) => {           // Node hover handler
    console.log('Hovered node:', node);
  }
};

const mindMap = new NodeQMindMap(config);
```

## 📊 Supported JSON Formats

NodeQ automatically detects and converts various JSON structures:

### Standard Format
```json
{
  "topic": "Root Node",
  "summary": "Description",
  "skills": ["Skill1", "Skill2"],
  "children": [...]
}
```

### Alternative Formats
```json
// Name-based structure
{
  "name": "Root Node",
  "description": "Details",
  "children": [...]
}

// Title-based structure  
{
  "title": "Root Node",
  "content": "Details",
  "items": [...]
}

// Generic object structure
{
  "label": "Root Node",
  "data": "Details", 
  "nodes": [...]
}
```

## 🎨 Styling & Themes

### Custom CSS Classes

```css
.nodeq-mindmap {
  font-family: 'Roboto', sans-serif;
}

.nodeq-node {
  cursor: pointer;
  transition: all 0.3s ease;
}

.nodeq-node:hover {
  transform: scale(1.05);
}

.nodeq-link {
  stroke-width: 2px;
  opacity: 0.6;
}
```

### Programmatic Styling

```javascript
mindMap.updateTheme({
  nodeColor: '#667eea',
  textColor: '#ffffff', 
  linkColor: '#764ba2',
  gradient: true
});
```

## 🔄 Dynamic Updates

```javascript
// Update data
mindMap.updateData(newJsonData);

// Add new node
mindMap.addNode(parentNode, {
  topic: "New Node",
  summary: "Added dynamically"
});

// Remove node
mindMap.removeNode(nodeId);

// Refresh visualization
mindMap.refresh();
```

## 📱 Framework Integration

### React Example

```jsx
import React, { useEffect, useRef } from 'react';
import { NodeQMindMap } from 'nodeq-mindmap';

const MindMapComponent = ({ data }) => {
  const containerRef = useRef(null);
  const mindMapRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && data) {
      mindMapRef.current = new NodeQMindMap({
        container: containerRef.current,
        data: data,
        width: 800,
        height: 600
      });
      
      mindMapRef.current.render();
    }

    return () => {
      if (mindMapRef.current) {
        mindMapRef.current.destroy();
      }
    };
  }, [data]);

  return <div ref={containerRef} className="mindmap-container" />;
};
```

### Vue Example

```vue
<template>
  <div ref="mindmapContainer" class="mindmap-container"></div>
</template>

<script>
import { NodeQMindMap } from 'nodeq-mindmap';

export default {
  props: ['data'],
  mounted() {
    this.mindMap = new NodeQMindMap({
      container: this.$refs.mindmapContainer,
      data: this.data,
      width: 800,
      height: 600
    });
    
    this.mindMap.render();
  },
  beforeDestroy() {
    if (this.mindMap) {
      this.mindMap.destroy();
    }
  }
};
</script>
```

## 🔌 API Reference

### Constructor
- `new NodeQMindMap(config)` - Creates a new mind map instance

### Methods
- `render()` - Renders the mind map
- `updateData(data)` - Updates the data and re-renders
- `updateTheme(theme)` - Updates styling theme
- `addNode(parent, node)` - Adds a new node
- `removeNode(nodeId)` - Removes a node
- `expandAll()` - Expands all collapsed nodes
- `collapseAll()` - Collapses all expandable nodes
- `zoomToFit()` - Zooms to fit all content
- `exportSVG()` - Exports as SVG string
- `exportPNG()` - Exports as PNG blob
- `destroy()` - Cleans up the instance

### Events
- `nodeClick` - Fired when a node is clicked
- `nodeHover` - Fired when a node is hovered
- `nodeExpand` - Fired when a node is expanded
- `nodeCollapse` - Fired when a node is collapsed

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/your-username/nodeq-mindmap.git
cd nodeq-mindmap

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [D3.js](https://d3js.org/) for powerful data visualization
- Inspired by mind mapping and knowledge visualization principles
- Community feedback and contributions

## 📞 Support

- 📧 Email: support@nodeq.dev
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/nodeq-mindmap/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/nodeq-mindmap/discussions)

---

Made with ❤️ by the NODEQ Team