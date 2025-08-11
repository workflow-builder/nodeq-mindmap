import * as d3 from 'd3';
import { PipelineEngine, DataSample, PipelineConfig } from './pipeline-engine';

export interface MindMapNode {
  topic: string;
  summary?: string;
  skills?: string[];
  children?: MindMapNode[];
  [key: string]: any;
}

export interface EnhancedNodeQConfig extends NodeQConfig {
  pipelineMode?: boolean;
  onPipelineCreated?: (pipeline: PipelineConfig) => void;
  onDataTransformed?: (result: any) => void;
}

export interface NodeQConfig {
  container: string | HTMLElement;
  data: any;
  width?: number;
  height?: number;
  theme?: {
    nodeColor?: string;
    textColor?: string;
    linkColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
  };
  interactive?: boolean;
  zoomable?: boolean;
  collapsible?: boolean;
  nodeSpacing?: number;
  levelSpacing?: number;
  onNodeClick?: (node: MindMapNode) => void;
  onNodeHover?: (node: MindMapNode) => void;
}

export class JsonSchemaAdapter {
  static convertToStandard(data: any): MindMapNode {
    if (!data || typeof data !== 'object') {
      return { topic: 'Invalid Data', summary: 'Unable to process data' };
    }

    const result: MindMapNode = {
      topic: this.extractTopic(data),
      summary: this.extractSummary(data),
      skills: this.extractSkills(data)
    };

    const children = this.extractChildren(data);
    if (children && children.length > 0) {
      result.children = children.map(child => this.convertToStandard(child));
    }

    return result;
  }

  private static extractTopic(obj: any): string {
    const topicFields = ['topic', 'name', 'title', 'label', 'key', 'id'];
    for (const field of topicFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        return obj[field];
      }
    }
    return Object.keys(obj)[0] || 'Unnamed Node';
  }

  private static extractSummary(obj: any): string | undefined {
    const summaryFields = ['summary', 'description', 'content', 'detail', 'info', 'text'];
    for (const field of summaryFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        return obj[field];
      }
    }
    return undefined;
  }

  private static extractSkills(obj: any): string[] | undefined {
    const skillFields = ['skills', 'tags', 'categories', 'keywords', 'attributes'];
    for (const field of skillFields) {
      if (Array.isArray(obj[field])) {
        return obj[field].filter(item => typeof item === 'string');
      }
    }
    return undefined;
  }

  private static extractChildren(obj: any): any[] | undefined {
    const childFields = ['children', 'items', 'nodes', 'subitems', 'elements', 'branches'];
    for (const field of childFields) {
      if (Array.isArray(obj[field])) {
        return obj[field];
      }
    }
    return undefined;
  }
}

export class NodeQMindMap {
  private config: Required<NodeQConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private g: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private data: MindMapNode;
  private container: HTMLElement;
  private pipelineEngine: PipelineEngine;
  private currentPipelineId: string | null = null;

  constructor(config: NodeQConfig) {
    this.config = {
      container: config.container,
      data: config.data,
      width: config.width || 800,
      height: config.height || 600,
      theme: {
        nodeColor: '#4299e1',
        textColor: '#2d3748',
        linkColor: '#a0aec0',
        backgroundColor: '#ffffff',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        ...config.theme
      },
      interactive: config.interactive !== undefined ? config.interactive : true,
      zoomable: config.zoomable !== undefined ? config.zoomable : true,
      collapsible: config.collapsible !== undefined ? config.collapsible : true,
      nodeSpacing: config.nodeSpacing || 200,
      levelSpacing: config.levelSpacing || 300,
      onNodeClick: config.onNodeClick || (() => {}),
      onNodeHover: config.onNodeHover || (() => {})
    };

    // Get container element
    if (typeof this.config.container === 'string') {
      const element = document.querySelector(this.config.container);
      if (!element) {
        throw new Error(`Container element not found: ${this.config.container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = this.config.container;
    }

    // Convert data to standard format
    this.data = JsonSchemaAdapter.convertToStandard(this.config.data);

    // Initialize pipeline engine
    this.pipelineEngine = new PipelineEngine();
  }

  render(): void {
    this.createSVG();
    this.renderMindMap();
  }

  updateData(data: any): void {
    this.config.data = data;
    this.data = JsonSchemaAdapter.convertToStandard(data);
    this.renderMindMap();
  }

  updateTheme(theme: Partial<NodeQConfig['theme']>): void {
    this.config.theme = { ...this.config.theme, ...theme };
    this.renderMindMap();
  }

  exportSVG(): string {
    if (!this.svg) return '';
    return new XMLSerializer().serializeToString(this.svg.node()!);
  }

  destroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
  }

  private createSVG(): void {


  async startRealtimeProcessing(): Promise<void> {
    if (!this.currentPipelineId) {
      throw new Error('No active pipeline for real-time processing');
    }

    await this.pipelineEngine.startRealtimeProcessing(this.currentPipelineId);
    console.log('Real-time processing started for pipeline:', this.currentPipelineId);
  }

  getPipelineStats(): any {
    if (!this.currentPipelineId) {
      throw new Error('No active pipeline');
    }

    return this.pipelineEngine.getPipelineStats(this.currentPipelineId);
  }

  async configureDataSource(sourceConfig: DataSourceConfig): Promise<void> {
    // This method allows adding data sources to existing pipeline
    const pipeline = this.pipelineEngine.getPipeline(this.currentPipelineId!);
    if (!pipeline) {
      throw new Error('No active pipeline');
    }

    pipeline.dataSources.push(sourceConfig);
    
    // Update the mindmap visualization
    const pipelineMindMap = this.pipelineToMindMap(pipeline);
    this.updateData(pipelineMindMap);
  }

</old_str>

    // Clear existing content
    d3.select(this.container).selectAll('*').remove();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .style('background-color', this.config.theme.backgroundColor);

    // Create main group for zooming/panning
    this.g = this.svg.append('g');

    // Add zoom behavior if enabled
    if (this.config.zoomable) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
          this.g!.attr('transform', event.transform);
        });


  // Enhanced Pipeline Management Methods
  async createDataPipeline(name: string, inputSample: any, outputSample: any, options?: {
    modelConfig?: ModelConfig;
    dataSources?: DataSourceConfig[];
    etlOptions?: any;
  }): Promise<PipelineConfig> {
    const inputDataSample: DataSample = {
      format: 'json',
      schema: this.extractSchema(inputSample),
      data: inputSample
    };

    const outputDataSample: DataSample = {
      format: 'json', 
      schema: this.extractSchema(outputSample),
      data: outputSample
    };

    const pipeline = await this.pipelineEngine.createPipeline(name, inputDataSample, outputDataSample, options);
    this.currentPipelineId = pipeline.id;

    // Convert pipeline to enhanced mindmap visualization
    const pipelineMindMap = this.pipelineToMindMap(pipeline);
    this.updateData(pipelineMindMap);

    return pipeline;
  }

  async updatePipelineInput(newInputSample: any): Promise<PipelineConfig> {
    if (!this.currentPipelineId) {
      throw new Error('No active pipeline to update');
    }

    const inputDataSample: DataSample = {
      format: 'json',
      schema: this.extractSchema(newInputSample),
      data: newInputSample
    };

    const pipeline = await this.pipelineEngine.updatePipeline(this.currentPipelineId, inputDataSample);

    // Update mindmap visualization
    const pipelineMindMap = this.pipelineToMindMap(pipeline);
    this.updateData(pipelineMindMap);

    return pipeline;
  }

  async updatePipelineOutput(newOutputSample: any): Promise<PipelineConfig> {
    if (!this.currentPipelineId) {
      throw new Error('No active pipeline to update');
    }

    const outputDataSample: DataSample = {
      format: 'json',
      schema: this.extractSchema(newOutputSample),
      data: newOutputSample
    };

    const pipeline = await this.pipelineEngine.updatePipeline(this.currentPipelineId, undefined, outputDataSample);

    // Update mindmap visualization
    const pipelineMindMap = this.pipelineToMindMap(pipeline);
    this.updateData(pipelineMindMap);

    return pipeline;
  }

  executePipeline(inputData: any): any {
    if (!this.currentPipelineId) {
      throw new Error('No active pipeline to execute');
    }

    return this.pipelineEngine.executePipeline(this.currentPipelineId, inputData);
  }

  exportPipelineCode(): string {
    if (!this.currentPipelineId) {
      throw new Error('No active pipeline to export');
    }

    return this.pipelineEngine.generatePipelineCode(this.currentPipelineId);
  }

  private extractSchema(data: any): any {
    if (Array.isArray(data)) {
      return data.length > 0 ? this.extractSchema(data[0]) : {};
    }

    if (typeof data === 'object' && data !== null) {
      const schema: any = {};
      for (const [key, value] of Object.entries(data)) {
        schema[key] = typeof value;
      }
      return schema;
    }

    return typeof data;
  }

  private pipelineToMindMap(pipeline: PipelineConfig): MindMapNode {
    const children: MindMapNode[] = [];

    // Data Sources Node
    if (pipeline.dataSources && pipeline.dataSources.length > 0) {
      children.push({
        topic: 'Data Sources',
        summary: `${pipeline.dataSources.length} connected sources`,
        children: pipeline.dataSources.map(source => ({
          topic: source.type.toUpperCase(),
          summary: `${source.connection.host || source.connection.apiEndpoint || 'Local'}`,
          skills: [
            `Type: ${source.type}`,
            `Polling: ${source.polling?.interval || 'Real-time'}ms`
          ],
          children: []
        }))
      });
    }

    // Input Schema Node
    children.push({
      topic: 'Input Schema',
      summary: 'Data input configuration',
      skills: Object.keys(pipeline.inputSample.schema || {}),
      children: pipeline.inputSample.metadata?.isTimeSeries ? [{
        topic: 'Time Series',
        summary: `Time field: ${pipeline.inputSample.metadata.timeField}`,
        skills: [`Sample Rate: ${pipeline.inputSample.metadata.sampleRate || 'Auto'}`],
        children: []
      }] : []
    });

    // ML Model Configuration
    children.push({
      topic: 'ML Model',
      summary: `${pipeline.modelConfig.type} model`,
      skills: [
        `Type: ${pipeline.modelConfig.type}`,
        `Version: ${pipeline.version}`,
        ...(pipeline.modelConfig.modelName ? [`Model: ${pipeline.modelConfig.modelName}`] : [])
      ],
      children: []
    });

    // ETL Configuration
    if (pipeline.etlConfig) {
      children.push({
        topic: 'ETL Process',
        summary: 'Extract, Transform, Load configuration',
        children: [
          {
            topic: 'Extraction',
            summary: `${pipeline.etlConfig.extractionRules.length} extraction rules`,
            children: []
          },
          {
            topic: 'Validation',
            summary: `${pipeline.etlConfig.validationRules.length} validation rules`,
            skills: [`Error Handling: ${pipeline.etlConfig.errorHandling}`],
            children: []
          },
          {
            topic: 'Processing',
            summary: 'Transformation configuration',
            skills: [
              `Parallel: ${pipeline.etlConfig.parallelProcessing ? 'Yes' : 'No'}`,
              `Checkpoint: ${pipeline.etlConfig.checkpointInterval}ms`
            ],
            children: []
          }
        ]
      });
    }

    // Transformations Node  
    children.push({
      topic: 'Transformations',
      summary: `${pipeline.transformationRules.length} transformation rules`,
      children: pipeline.transformationRules.map(rule => ({
        topic: `${rule.sourceField} → ${rule.targetField}`,
        summary: `${rule.type} transformation`,
        skills: [
          `Confidence: ${(rule.confidence * 100).toFixed(1)}%`,
          `ML Score: ${((rule.mlScore || 0) * 100).toFixed(1)}%`,
          `Logic: ${rule.logic.substring(0, 50)}...`
        ],
        children: []
      }))
    });

    // Output Schema Node
    children.push({
      topic: 'Output Schema',
      summary: 'Data output configuration',
      skills: Object.keys(pipeline.outputSample.schema || {}),
      children: []
    });

    // Performance Metrics
    if (pipeline.performance) {
      children.push({
        topic: 'Performance',
        summary: 'Pipeline performance metrics',
        skills: [
          `Throughput: ${pipeline.performance.throughput} ops`,
          `Latency: ${pipeline.performance.latency.toFixed(2)}ms`,
          `Error Rate: ${(pipeline.performance.errorRate * 100).toFixed(2)}%`
        ],
        children: []
      });
    }

    return {
      topic: pipeline.name,
      summary: `ETL Pipeline - Accuracy: ${(pipeline.accuracy * 100).toFixed(1)}%`,
      skills: [
        `Created: ${pipeline.createdAt.toLocaleDateString()}`,
        `Version: ${pipeline.version}`,
        `Model: ${pipeline.modelConfig.type}`
      ],
      children: children
    };
  }

  getAllPipelines(): PipelineConfig[] {
    return this.pipelineEngine.getAllPipelines();
  }

  switchToPipeline(pipelineId: string): void {
    const pipeline = this.pipelineEngine.getPipeline(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    this.currentPipelineId = pipelineId;
    const pipelineMindMap = this.pipelineToMindMap(pipeline);
    this.updateData(pipelineMindMap);
  }


      this.svg.call(zoom);
    }
  }

  private renderMindMap(): void {
    if (!this.g) return;

    // Clear existing content
    this.g.selectAll('*').remove();

    // Create hierarchy
    const root = d3.hierarchy(this.data);

    // Create tree layout
    const treeLayout = d3.tree<MindMapNode>()
      .size([this.config.height - 100, this.config.width - 200])
      .separation((a, b) => a.parent === b.parent ? 1 : 2);

    // Generate tree
    const treeData = treeLayout(root);

    // Create links
    const links = this.g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y + 100)
        .y(d => d.x + 50)
      )
      .style('fill', 'none')
      .style('stroke', this.config.theme.linkColor)
      .style('stroke-width', 2);

    // Create nodes
    const nodes = this.g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y + 100},${d.x + 50})`)
      .style('cursor', this.config.interactive ? 'pointer' : 'default');

    // Add node circles
    nodes.append('circle')
      .attr('r', 25)
      .style('fill', this.config.theme.nodeColor)
      .style('stroke', '#fff')
      .style('stroke-width', 3);

    // Add node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -30 : 30)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-family', this.config.theme.fontFamily)
      .style('font-size', `${this.config.theme.fontSize}px`)
      .style('fill', this.config.theme.textColor)
      .text(d => d.data.topic);

    // Add interactivity
    if (this.config.interactive) {
      nodes.on('click', (event, d) => {
        this.config.onNodeClick(d.data);
      });

      nodes.on('mouseover', (event, d) => {
        this.config.onNodeHover(d.data);
      });
    }
  }

  zoomToFit(): void {
    if (!this.svg || !this.g) return;

    const bounds = this.g.node()!.getBBox();
    const fullWidth = this.config.width;
    const fullHeight = this.config.height;
    const width = bounds.width;
    const height = bounds.height;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;

    if (width === 0 || height === 0) return;

    const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    const zoom = d3.zoom<SVGSVGElement, unknown>();
    this.svg
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }

  private renderMindMap(): void {
    if (!this.g) return;

    // Clear existing content
    this.g.selectAll('*').remove();

    // Create hierarchy
    const root = d3.hierarchy(this.data);

    // Create tree layout
    const treeLayout = d3.tree<MindMapNode>()
      .size([this.config.height - 100, this.config.width - 200])
      .separation((a, b) => a.parent === b.parent ? 1 : 2);

    // Generate tree
    const treeData = treeLayout(root);

    // Create links
    const links = this.g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y + 100)
        .y(d => d.x + 50)
      )
      .style('fill', 'none')
      .style('stroke', this.config.theme.linkColor)
      .style('stroke-width', 2);

    // Create nodes
    const nodes = this.g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y + 100},${d.x + 50})`)
      .style('cursor', this.config.interactive ? 'pointer' : 'default');

    // Add node circles
    nodes.append('circle')
      .attr('r', 25)
      .style('fill', this.config.theme.nodeColor)
      .style('stroke', '#fff')
      .style('stroke-width', 3);

    // Add node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -30 : 30)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-family', this.config.theme.fontFamily)
      .style('font-size', `${this.config.theme.fontSize}px`)
      .style('fill', this.config.theme.textColor)
      .text(d => d.data.topic);

    // Add interactivity
    if (this.config.interactive) {
      nodes.on('click', (event, d) => {
        this.config.onNodeClick(d.data);
      });

      nodes.on('mouseover', (event, d) => {
        this.config.onNodeHover(d.data);
      });
    }
  }

  zoomToFit(): void {
    if (!this.svg || !this.g) return;

    const bounds = this.g.node()!.getBBox();
    const fullWidth = this.config.width;
    const fullHeight = this.config.height;
    const width = bounds.width;
    const height = bounds.height;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;

    if (width === 0 || height === 0) return;

    const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    const zoom = d3.zoom<SVGSVGElement, unknown>();
    this.svg
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }
}

export default NodeQMindMap;