
# Framework Integration Examples

Complete integration guides for popular web frameworks.

## React Integration

```jsx
import React, { useEffect, useRef } from 'react';
import { NodeQMindMap } from 'nodeq-mindmap';

const MindMapComponent = ({ data }) => {
  const containerRef = useRef(null);
  const mindMapRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      mindMapRef.current = new NodeQMindMap({
        container: containerRef.current,
        data: data,
        width: 800,
        height: 600,
        theme: { 
          nodeColor: '#4299e1',
          backgroundColor: '#f7fafc' 
        },
        onNodeClick: (node) => {
          console.log('Clicked:', node.topic);
        }
      });
      mindMapRef.current.render();
    }

    return () => {
      if (mindMapRef.current) {
        mindMapRef.current.destroy();
      }
    };
  }, [data]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }}></div>;
};

export default MindMapComponent;
```

## Vue.js Integration

```vue
<template>
  <div ref="mindmapContainer" class="mindmap-container"></div>
</template>

<script>
import { NodeQMindMap } from 'nodeq-mindmap';

export default {
  name: 'MindMapComponent',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mindMap: null
    };
  },
  mounted() {
    this.initializeMindMap();
  },
  beforeUnmount() {
    if (this.mindMap) {
      this.mindMap.destroy();
    }
  },
  methods: {
    initializeMindMap() {
      this.mindMap = new NodeQMindMap({
        container: this.$refs.mindmapContainer,
        data: this.data,
        width: 800,
        height: 600,
        interactive: true,
        onNodeClick: (node) => {
          this.$emit('node-clicked', node);
        }
      });
      this.mindMap.render();
    }
  }
};
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  height: 600px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
</style>
```

## Angular Integration

```typescript
// mindmap.component.ts
import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NodeQMindMap } from 'nodeq-mindmap';

@Component({
  selector: 'app-mindmap',
  template: `<div #mindmapContainer class="mindmap-container"></div>`,
  styleUrls: ['./mindmap.component.css']
})
export class MindMapComponent implements OnInit, OnDestroy {
  @ViewChild('mindmapContainer', { static: true }) container!: ElementRef;
  @Input() data: any;
  
  private mindMap: NodeQMindMap | null = null;

  ngOnInit() {
    this.mindMap = new NodeQMindMap({
      container: this.container.nativeElement,
      data: this.data,
      width: 800,
      height: 600,
      theme: {
        nodeColor: '#6366f1',
        backgroundColor: '#f8fafc'
      }
    });
    this.mindMap.render();
  }

  ngOnDestroy() {
    if (this.mindMap) {
      this.mindMap.destroy();
    }
  }
}
```

## Vanilla HTML/JavaScript

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NodeQ MindMap Demo</title>
    <script src="https://unpkg.com/nodeq-mindmap@2.1.0/dist/index.umd.js"></script>
    <style>
        #mindmap-container {
            width: 100%;
            height: 600px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>My Mind Map</h1>
    <div id="mindmap-container"></div>
    
    <script>
        // Sample data
        const projectData = {
          "topic": "My Project",
          "summary": "Full-stack web application",
          "children": [
            {
              "topic": "Frontend",
              "skills": ["React", "TypeScript", "Tailwind CSS"],
              "children": [
                { "topic": "Components", "skills": ["Header", "Sidebar", "Dashboard"] },
                { "topic": "State Management", "skills": ["Redux", "Context API"] }
              ]
            },
            {
              "topic": "Backend", 
              "skills": ["Node.js", "Express", "PostgreSQL"],
              "children": [
                { "topic": "API Routes", "skills": ["/api/users", "/api/projects"] },
                { "topic": "Database", "skills": ["Users table", "Projects table"] }
              ]
            }
          ]
        };

        // Initialize mind map
        const mindMap = new NodeQMindMap({
            container: '#mindmap-container',
            data: projectData,
            width: 1000,
            height: 600,
            theme: {
                nodeColor: '#3b82f6',
                textColor: '#1f2937',
                backgroundColor: '#f8fafc'
            },
            interactive: true,
            zoomable: true,
            collapsible: true,
            onNodeClick: (node) => {
                alert(`Clicked: ${node.topic}`);
            },
            onNodeHover: (node) => {
                console.log(`Hovering: ${node.topic}`);
            }
        });

        // Render the mind map
        mindMap.render();
        
        // Example: Update data after 3 seconds
        setTimeout(() => {
            const newData = {
                ...projectData,
                topic: "Updated Project"
            };
            mindMap.updateData(newData);
        }, 3000);
    </script>
</body>
</html>
```

## Advanced Configuration Examples

```javascript
// Complete configuration example
const advancedConfig = {
  container: '#advanced-mindmap',
  data: myData,
  width: 1200,
  height: 800,
  theme: {
    nodeColor: '#6B46C1', // Purple
    textColor: '#1A202C', // Dark Gray
    linkColor: '#A0AEC0', // Gray
    backgroundColor: '#F7FAFC', // Very Light Gray
    fontSize: 16,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    nodeRadius: 8,
    nodeOpacity: 0.95,
    linkOpacity: 0.8,
    hoverColor: '#44337A' // Darker Purple
  },
  layout: {
    algorithm: 'force', // Use force-directed layout
    nodeSpacing: 250,
    levelSpacing: 400
  },
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'ease-out'
  },
  interactive: true,
  zoomable: true,
  collapsible: true,
  onNodeClick: (node) => {
    console.log(`Advanced config: Clicked on ${node.topic}`);
  }
};

const advancedMindMap = new NodeQMindMap(advancedConfig);
advancedMindMap.render();
```

## Theme Presets

```javascript
// Built-in theme presets
const themes = {
  default: {
    nodeColor: '#4299e1',
    textColor: '#2d3748',
    linkColor: '#a0aec0',
    backgroundColor: '#ffffff'
  },
  dark: {
    nodeColor: '#2d3748',
    textColor: '#f7fafc',
    linkColor: '#4a5568',
    backgroundColor: '#1a202c'
  },
  forest: {
    nodeColor: '#38a169',
    textColor: '#1a202c',
    linkColor: '#68d391',
    backgroundColor: '#f0fff4'
  },
  ocean: {
    nodeColor: '#3182ce',
    textColor: '#ffffff',
    linkColor: '#63b3ed',
    backgroundColor: '#ebf8ff'
  }
};

// Apply a preset theme
const mindMap = new NodeQMindMap({
  container: '#mindmap',
  data: myData,
  theme: themes.dark
});
```
