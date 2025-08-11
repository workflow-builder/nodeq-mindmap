
# Installation Guide

## 📦 Quick Installation

```bash
npm install nodeq-mindmap
```

```bash
yarn add nodeq-mindmap
```

## 🎯 Basic Usage

### Simple Mind Map

```javascript
import { NodeQMindMap } from 'nodeq-mindmap';

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

const mindMap = new NodeQMindMap({
  container: '#mindmap-container',
  data: data,
  width: 800,
  height: 600
});

mindMap.render();
```

### HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>NodeQ MindMap</title>
    <script src="https://unpkg.com/nodeq-mindmap@2.1.0/dist/index.umd.js"></script>
</head>
<body>
    <div id="mindmap-container"></div>
    <script>
        const mindMap = new NodeQMindMap({
            container: '#mindmap-container',
            data: yourData,
            width: 800,
            height: 600
        });
        mindMap.render();
    </script>
</body>
</html>
```

## 🔧 Configuration Options

### Basic Configuration

```javascript
const config = {
  container: '#mindmap-container',
  data: jsonData,
  width: 800,
  height: 600,
  interactive: true,
  zoomable: true,
  collapsible: true,
  
  theme: {
    nodeColor: '#4299e1',
    textColor: '#2d3748',
    linkColor: '#a0aec0',
    backgroundColor: '#ffffff',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif'
  },
  
  onNodeClick: (node, event) => {
    console.log('Clicked node:', node);
  }
};
```

### Theme Presets

```javascript
const themes = {
  default: { nodeColor: '#4299e1', textColor: '#2d3748' },
  dark: { nodeColor: '#2d3748', textColor: '#f7fafc', backgroundColor: '#1a202c' },
  forest: { nodeColor: '#38a169', textColor: '#1a202c', backgroundColor: '#f0fff4' },
  ocean: { nodeColor: '#3182ce', textColor: '#ffffff', backgroundColor: '#ebf8ff' }
};
```

## 🚀 Framework Integration

### React Component

```jsx
import React, { useEffect, useRef } from 'react';
import { NodeQMindMap } from 'nodeq-mindmap';

const MindMapComponent = ({ data }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current && data) {
      const mindMap = new NodeQMindMap({
        container: containerRef.current,
        data: data,
        width: 800,
        height: 600
      });
      mindMap.render();
    }
  }, [data]);
  
  return <div ref={containerRef}></div>;
};
```

### Vue.js Component

```vue
<template>
  <div ref="mindmapContainer"></div>
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
  }
};
</script>
```
