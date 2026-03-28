# nodeq-mindmap

[![npm version](https://badge.fury.io/js/nodeq-mindmap.svg)](https://badge.fury.io/js/nodeq-mindmap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Interactive D3.js mind map visualization library with a built-in ETL pipeline engine. Render career maps, org charts, or any hierarchical JSON data in the browser, and define data transformation pipelines in code.

## Features

- **Universal JSON rendering** — any JSON object is automatically converted to a mind map
- **Interactive** — click to expand/collapse nodes, zoom, pan
- **Themeable** — control colors, font, node size
- **Framework agnostic** — works with React, Vue, Angular, or vanilla JS
- **ETL pipeline engine** — define input/output schemas, track transformation rules, and execute pipelines in memory
- **Pipeline visualization** — render an active pipeline as a mind map to explore its structure
- **CLI** — generate SVG files from JSON on the command line (headless via jsdom)

## Installation

```bash
npm install nodeq-mindmap
```

D3 v7 is a peer dependency:

```bash
npm install d3
```

## Quick Start

### Browser / bundler

```javascript
import { NodeQMindMap } from 'nodeq-mindmap';

const map = new NodeQMindMap({
  container: '#my-container',   // CSS selector or HTMLElement
  data: {
    topic: 'Software Engineer',
    children: [
      { topic: 'Frontend', skills: ['React', 'TypeScript'] },
      { topic: 'Backend',  skills: ['Node.js', 'PostgreSQL'] },
    ]
  },
  width: 900,
  height: 600,
  onNodeClick: (node) => console.log(node.topic),
});

map.render();
```

### Any JSON shape

`JsonSchemaAdapter.convertToStandard()` converts arbitrary JSON into the `MindMapNode` tree format before rendering:

```javascript
import { NodeQMindMap, JsonSchemaAdapter } from 'nodeq-mindmap';

const raw = { name: 'My API', version: '2.0', routes: ['/users', '/posts'] };
const data = JsonSchemaAdapter.convertToStandard(raw);

new NodeQMindMap({ container: '#root', data }).render();
```

## API

### `new NodeQMindMap(config)`

| Option | Type | Default | Description |
|---|---|---|---|
| `container` | `string \| HTMLElement` | required | CSS selector or DOM element |
| `data` | `any` | required | Hierarchical data (see `MindMapNode`) |
| `width` | `number` | `800` | SVG width in px |
| `height` | `number` | `600` | SVG height in px |
| `theme` | `Partial<Theme>` | — | Colors, font, fontSize |
| `interactive` | `boolean` | `true` | Enable click/hover |
| `zoomable` | `boolean` | `true` | Enable pan/zoom |
| `collapsible` | `boolean` | `true` | Click nodes to collapse |
| `onNodeClick` | `(node) => void` | — | Click callback |
| `onNodeHover` | `(node) => void` | — | Hover callback |

### Instance methods

```typescript
map.render()                    // Draw the mind map
map.updateData(data)            // Replace data and re-render
map.updateTheme(theme)          // Merge theme and re-render
map.exportSVG()                 // Return SVG markup string
map.destroy()                   // Remove SVG from DOM

// Pipeline helpers
await map.createDataPipeline(name, inputSample, outputSample, options?)
map.executePipeline(inputData)
map.getAllPipelines()
map.switchToPipeline(pipelineId)
```

### `MindMapNode` shape

```typescript
interface MindMapNode {
  topic: string;          // Node label (required)
  summary?: string;       // Subtitle shown in detail panels
  skills?: string[];      // Tag list
  children?: MindMapNode[];
}
```

### `Theme` options

```typescript
{
  nodeColor: string;       // default '#4299e1'
  textColor: string;       // default '#2d3748'
  linkColor: string;       // default '#a0aec0'
  backgroundColor: string; // default '#ffffff'
  fontSize: number;        // default 14
  fontFamily: string;      // default 'Arial, sans-serif'
}
```

## Pipeline Engine

`PipelineEngine` is a standalone class for defining and running in-memory ETL pipelines. It does not require a browser.

```javascript
import { PipelineEngine } from 'nodeq-mindmap';

const engine = new PipelineEngine();

const pipeline = await engine.createPipeline(
  'User ETL',
  { format: 'json', schema: { id: 'number', name: 'string' }, data: { id: 1, name: 'Alice' } },
  { format: 'json', schema: { userId: 'number', displayName: 'string' }, data: { userId: 1, displayName: 'Alice' } }
);

const result = engine.executePipeline(pipeline.id, { id: 2, name: 'Bob' });
// { processed: true, data: { id: 2, name: 'Bob' }, timestamp, pipelineId }

console.log(engine.generatePipelineCode(pipeline.id));
// Outputs a TypeScript function stub for the pipeline
```

### `PipelineEngine` methods

```typescript
createPipeline(name, inputSample, outputSample, options?)  // async, returns PipelineConfig
updatePipeline(id, inputSample?, outputSample?)            // async
executePipeline(id, inputData)                             // sync, returns result object
getPipeline(id)                                            // returns PipelineConfig | undefined
getAllPipelines()                                           // returns PipelineConfig[]
getPipelineStats(id)                                       // returns perf stats
generatePipelineCode(id)                                   // returns TS function stub
```

## CLI

```bash
# Generate an SVG mind map from a JSON file
npx nodeq-mindmap generate -i data.json -o output.svg

# Create a pipeline definition from input/output samples
npx nodeq-mindmap create-pipeline -n "My ETL" -i input.json -o output.json
```

The `generate` command uses jsdom to run D3 headlessly — no browser required.

## Ports

Server-side / language-specific ports of the data model and pipeline engine are available:

- **Go** — `packages/go/` — `MindMapNode`, `PipelineEngine`, `JsonSchemaAdapter` as a Go module
- **Python** — `packages/python/` — `MindMapNode`, `PipelineEngine`, `JsonSchemaAdapter` as Python dataclasses

These ports implement the same data structures and pipeline logic without the D3 visualization layer.

## License

MIT
