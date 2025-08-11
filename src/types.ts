// Type definitions for NodeQ MindMap package

export interface MindMapNode {
  topic: string;
  summary?: string;
  skills?: string[];
  children?: MindMapNode[];
  [key: string]: any;
}

export interface Theme {
  nodeColor?: string;
  textColor?: string;
  linkColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface NodeQConfig {
  container: string | HTMLElement;
  data: any;
  width?: number;
  height?: number;
  theme?: Theme;
  interactive?: boolean;
  zoomable?: boolean;
  collapsible?: boolean;
  nodeSpacing?: number;
  levelSpacing?: number;
  onNodeClick?: (node: MindMapNode) => void;
  onNodeHover?: (node: MindMapNode) => void;
}

export interface EnhancedNodeQConfig extends NodeQConfig {
  pipelineMode?: boolean;
  onPipelineCreated?: (pipeline: any) => void;
  onDataTransformed?: (result: any) => void;
}

// Data pipeline related types
export interface DataSample {
  format: string;
  schema: any;
  data: any;
  metadata?: any;
}

export interface PipelineConfig {
  id: string;
  name: string;
  inputSample: DataSample;
  outputSample: DataSample;
  transformationRules: any[];
  modelConfig: any;
  accuracy: number;
  version: string;
  createdAt: Date;
  dataSources?: any[];
  etlConfig?: any;
  performance?: any;
}