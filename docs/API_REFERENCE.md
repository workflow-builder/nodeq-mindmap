
# API Reference

## 📚 Core Classes

### NodeQMindMap

Main class for creating and managing mind maps and data pipelines.

```typescript
class NodeQMindMap {
  constructor(config: MindMapConfig)
  render(): void
  createDataPipeline(name: string, input: any, output: any, options?: PipelineOptions): Promise<Pipeline>
  executePipeline(data: any): any
  updateData(newData: any): void
  destroy(): void
}
```

### MindMapConfig

Configuration interface for mind map initialization.

```typescript
interface MindMapConfig {
  container: string | HTMLElement;
  data: any;
  width?: number;
  height?: number;
  theme?: ThemeConfig;
  layout?: LayoutConfig;
  animation?: AnimationConfig;
  interactive?: boolean;
  zoomable?: boolean;
  collapsible?: boolean;
  pipelineMode?: boolean;
  onNodeClick?: (node: any, event: Event) => void;
  onNodeHover?: (node: any, event: Event) => void;
  onRender?: () => void;
}
```

### ThemeConfig

Theme configuration for visual styling.

```typescript
interface ThemeConfig {
  nodeColor?: string;
  textColor?: string;
  linkColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  nodeRadius?: number;
  nodeOpacity?: number;
  linkOpacity?: number;
  hoverColor?: string;
}
```

### LayoutConfig

Layout configuration for node positioning.

```typescript
interface LayoutConfig {
  algorithm?: 'tree' | 'force' | 'radial';
  nodeSpacing?: number;
  levelSpacing?: number;
  rootX?: number;
  rootY?: number;
}
```

### AnimationConfig

Animation configuration for transitions.

```typescript
interface AnimationConfig {
  enabled?: boolean;
  duration?: number;
  easing?: string;
}
```

## 🚀 Pipeline Engine

### Pipeline

Represents a data transformation pipeline.

```typescript
interface Pipeline {
  id: string;
  name: string;
  transformationRules: TransformationRule[];
  accuracy: number;
  created: Date;
  lastUpdated: Date;
  execute(data: any): any;
  update(input: any, output: any): Promise<void>;
  exportCode(): string;
  getStats(): PipelineStats;
}
```

### TransformationRule

Individual transformation rule within a pipeline.

```typescript
interface TransformationRule {
  id: string;
  type: 'map' | 'calculate' | 'filter' | 'custom';
  sourceField: string;
  targetField: string;
  logic: string;
  confidence: number;
}
```

### PipelineOptions

Options for pipeline creation and configuration.

```typescript
interface PipelineOptions {
  modelConfig?: ModelConfig;
  dataSources?: DataSourceConfig[];
  etlOptions?: ETLOptions;
}
```

### ModelConfig

Configuration for ML models.

```typescript
interface ModelConfig {
  type: 'tensorflow' | 'huggingface' | 'openai' | 'custom';
  modelName?: string;
  localPath?: string;
  endpoint?: string;
  apiKey?: string;
  parameters?: Record<string, any>;
}
```

### DataSourceConfig

Configuration for data sources.

```typescript
interface DataSourceConfig {
  type: 'kafka' | 'iot-hub' | 'rest-api' | 'websocket' | 'database' | 'mqtt';
  connection: {
    host?: string;
    endpoint?: string;
    connectionString?: string;
    credentials?: Record<string, any>;
  };
  polling?: {
    interval?: number;
    batchSize?: number;
  };
}
```

### ETLOptions

Options for ETL processing.

```typescript
interface ETLOptions {
  errorHandling?: 'throw' | 'log' | 'ignore';
  parallelProcessing?: boolean;
  checkpointInterval?: number;
  batchSize?: number;
}
```

## 🎨 JSON Schema Adapter

### JSONSchemaAdapter

Utility class for converting JSON to mind map format.

```typescript
class JSONSchemaAdapter {
  static convertToMindMap(data: any, options?: ConversionOptions): MindMapNode
  static detectSchema(data: any): SchemaInfo
  static normalizeFieldNames(data: any): any
}
```

### MindMapNode

Structure representing a mind map node.

```typescript
interface MindMapNode {
  topic: string;
  summary?: string;
  skills?: string[];
  children?: MindMapNode[];
  _expanded?: boolean;
  _level?: number;
  _id?: string;
}
```

### ConversionOptions

Options for JSON to mind map conversion.

```typescript
interface ConversionOptions {
  maxDepth?: number;
  skipEmptyValues?: boolean;
  arrayHandling?: 'flatten' | 'group' | 'skip';
  fieldMapping?: Record<string, string>;
}
```

## 🖥️ CLI Interface

### CLI Commands

```bash
# Generate mind map
nodeq-mindmap generate [options]
  --input <file>           Input JSON file
  --output <file>          Output SVG file
  --width <number>         Canvas width
  --height <number>        Canvas height
  --theme <theme>          Theme preset

# Pipeline management
nodeq-mindmap pipeline <command> [options]
  create                   Create new pipeline
  execute                  Execute pipeline
  list                     List all pipelines
  stats                    Get pipeline statistics
  export-code              Export pipeline code
```

## 🔧 Utility Functions

### DOM Utilities

```typescript
// Safe DOM manipulation for CLI and browser
function safeQuerySelector(selector: string): HTMLElement | null
function safeCreateElement(tagName: string): HTMLElement
function safeSetAttribute(element: HTMLElement, name: string, value: string): void
```

### Data Processing

```typescript
// Data validation and processing
function validateJSONStructure(data: any): boolean
function sanitizeData(data: any): any
function calculateDataComplexity(data: any): number
```

### Performance Monitoring

```typescript
// Pipeline performance tracking
interface PipelineStats {
  totalExecutions: number;
  averageLatency: number;
  successRate: number;
  errorCount: number;
  throughput: number;
  lastExecution: Date;
}
```

## 🎯 Event Handlers

### Node Events

```typescript
// Node interaction events
onNodeClick: (node: MindMapNode, event: Event) => void
onNodeHover: (node: MindMapNode, event: Event) => void
onNodeExpand: (node: MindMapNode) => void
onNodeCollapse: (node: MindMapNode) => void
```

### Pipeline Events

```typescript
// Pipeline lifecycle events
onPipelineCreated: (pipeline: Pipeline) => void
onPipelineExecuted: (result: any, metrics: ExecutionMetrics) => void
onPipelineError: (error: Error, pipeline: Pipeline) => void
onDataTransformed: (input: any, output: any) => void
```

### Rendering Events

```typescript
// Rendering lifecycle events
onRenderStart: () => void
onRenderComplete: () => void
onThemeChanged: (oldTheme: ThemeConfig, newTheme: ThemeConfig) => void
onDataUpdated: (oldData: any, newData: any) => void
```

## 🚀 Advanced Usage

### Custom Transformation Functions

```typescript
// Define custom transformation logic
const customTransform = (input: any): any => {
  return {
    processedData: input.rawData.toUpperCase(),
    timestamp: new Date().toISOString(),
    metadata: {
      processedBy: 'custom-function',
      version: '1.0'
    }
  };
};

// Register with pipeline
pipeline.addCustomTransformation('customTransform', customTransform);
```

### Plugin System

```typescript
// Create custom plugins
interface MindMapPlugin {
  name: string;
  version: string;
  init(mindMap: NodeQMindMap): void;
  destroy(): void;
}

// Register plugin
mindMap.registerPlugin(myPlugin);
```

### Error Handling

```typescript
// Comprehensive error handling
try {
  const result = await mindMap.createDataPipeline(name, input, output);
} catch (error) {
  if (error instanceof PipelineCreationError) {
    console.error('Pipeline creation failed:', error.message);
  } else if (error instanceof ModelLoadError) {
    console.error('ML model loading failed:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```
