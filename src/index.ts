import * as d3 from 'd3';
import { PipelineEngine } from './pipeline-engine';
import type { DataSample, PipelineConfig } from './types';

export interface MindMapNode {
  topic: string;
  summary?: string;
  skills?: string[];
  children?: MindMapNode[];
  _expanded?: boolean; // internal collapse flag
  [key: string]: any;
}

type Theme = {
  nodeColor: string;
  textColor: string;
  linkColor: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
};

export interface NodeQConfig {
  container: string | HTMLElement;
  data: any;
  width?: number;
  height?: number;
  theme?: Partial<Theme>;
  interactive?: boolean;
  zoomable?: boolean;
  collapsible?: boolean;
  nodeSpacing?: number;
  levelSpacing?: number;
  onNodeClick?: (node: MindMapNode) => void;
  onNodeHover?: (node: MindMapNode) => void;
  onPipelineCreated?: (pipeline: PipelineConfig) => void;
  onDataTransformed?: (result: any) => void;
}

export class JsonSchemaAdapter {
  static convertToStandard(data: any): MindMapNode {
    if (!data || typeof data !== 'object') {
      return { topic: 'Invalid Data', summary: 'Unable to process data' };
    }
    const root: MindMapNode = {
      topic: data.topic || data.title || data.name || 'Root',
      summary: data.summary || data.description || undefined,
      skills: Array.isArray(data.skills) ? data.skills : undefined,
      children: []
    };
    const entries = Object.entries(data).filter(([k]) => !['topic','title','name','summary','description','skills','children'].includes(k));
    for (const [key, value] of entries) {
      if (value && typeof value === 'object') {
        root.children!.push({
          topic: key,
          summary: Array.isArray(value) ? `${value.length} item(s)` : undefined,
          children: Array.isArray(value)
            ? value.slice(0, 20).map((v, i) => typeof v === 'object' ? { topic: `${key}[${i}]`, children: [this.convertToStandard(v)] } : { topic: String(v) })
            : [this.convertToStandard(value)]
        });
      } else {
        root.children!.push({ topic: `${key}: ${String(value)}` });
      }
    }
    if (Array.isArray((data as any).children)) {
      root.children!.push(...(data as any).children.map((c: any) => this.convertToStandard(c)));
    }
    return root;
  }
}

type InternalConfig = {
  container: string | HTMLElement;
  data: any;
  width: number;
  height: number;
  theme: Theme;
  interactive: boolean;
  zoomable: boolean;
  collapsible: boolean;
  nodeSpacing: number;
  levelSpacing: number;
  onNodeClick: (node: MindMapNode) => void;
  onNodeHover: (node: MindMapNode) => void;
  onPipelineCreated?: (p: PipelineConfig) => void;
  onDataTransformed?: (r: any) => void;
};

export class NodeQMindMap {
  private config: InternalConfig;
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
      width: config.width ?? 800,
      height: config.height ?? 600,
      theme: {
        nodeColor: '#4299e1',
        textColor: '#2d3748',
        linkColor: '#a0aec0',
        backgroundColor: '#ffffff',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        ...(config.theme ?? {})
      },
      interactive: config.interactive ?? true,
      zoomable: config.zoomable ?? true,
      collapsible: config.collapsible ?? true,
      nodeSpacing: config.nodeSpacing ?? 200,
      levelSpacing: config.levelSpacing ?? 300,
      onNodeClick: config.onNodeClick ?? (() => {}),
      onNodeHover: config.onNodeHover ?? (() => {}),
      onPipelineCreated: config.onPipelineCreated,
      onDataTransformed: config.onDataTransformed
    };

    if (typeof this.config.container === 'string') {
      const el = (globalThis as any).document?.querySelector?.(this.config.container);
      if (!el) throw new Error(`Container element not found: ${this.config.container}`);
      this.container = el as HTMLElement;
    } else {
      this.container = this.config.container;
    }

    const std = JsonSchemaAdapter.convertToStandard(this.config.data);
    this.data = this.prepareExpanded(std);
    this.pipelineEngine = new PipelineEngine();
  }

  private prepareExpanded(node: MindMapNode): MindMapNode {
    const copy: MindMapNode = { ...node, _expanded: true };
    if (node.children) copy.children = node.children.map(c => this.prepareExpanded(c));
    return copy;
  }

  render(): void {
    this.createSVG();
    this.renderMindMap();
  }

  updateData(data: any): void {
    this.config.data = data;
    this.data = this.prepareExpanded(JsonSchemaAdapter.convertToStandard(data));
    this.renderMindMap();
  }

  updateTheme(theme: Partial<Theme>): void {
    this.config.theme = { ...this.config.theme, ...theme };
    this.renderMindMap();
  }

  exportSVG(): string {
    if (!this.svg) return '';
    return new XMLSerializer().serializeToString(this.svg.node()!);
  }

  destroy(): void {
    if (this.svg) this.svg.remove();
  }

  private createSVG(): void {
    d3.select(this.container).selectAll('*').remove();
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .style('background-color', this.config.theme.backgroundColor);
    this.g = this.svg.append('g');
    if (this.config.zoomable) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => this.g!.attr('transform', event.transform));
      this.svg.call(zoom as any);
    }
  }

  private collapseAware(node: MindMapNode): MindMapNode {
    if (!node._expanded) return { ...node, children: [] };
    if (!node.children) return node;
    return { ...node, children: node.children.map(c => this.collapseAware(c)) };
    }

  private renderMindMap(): void {
    if (!this.g) return;
    this.g.selectAll('*').remove();

    const root = d3.hierarchy(this.collapseAware(this.data) as any);
    const treeLayout = d3.tree<any>().size([this.config.height - 100, this.config.width - 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2));
    const treeData = treeLayout(root);

    this.g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => (d as any).y + 100)
        .y(d => (d as any).x + 50)
      )
      .style('fill', 'none')
      .style('stroke', this.config.theme.linkColor)
      .style('stroke-width', 2);

    const nodes = this.g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${(d as any).y + 100},${(d as any).x + 50})`)
      .style('cursor', this.config.interactive ? 'pointer' : 'default');

    nodes.append('circle')
      .attr('r', 25)
      .style('fill', this.config.theme.nodeColor)
      .style('stroke', '#fff')
      .style('stroke-width', 3);

    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => (d.children ? -30 : 30))
      .style('text-anchor', d => (d.children ? 'end' : 'start'))
      .style('font-family', this.config.theme.fontFamily)
      .style('font-size', `${this.config.theme.fontSize}px`)
      .style('fill', this.config.theme.textColor)
      .text(d => (d.data.topic));

    if (this.config.interactive) {
      nodes.on('click', (_, d: any) => {
        if (this.config.collapsible) {
          d.data._expanded = !d.data._expanded;
          this.renderMindMap();
        }
        this.config.onNodeClick(d.data);
      });
      nodes.on('mouseover', (_, d: any) => this.config.onNodeHover(d.data));
    }
  }

  // ===== Pipeline helpers =====
  async createDataPipeline(
    name: string,
    inputSample: any,
    outputSample: any,
    options?: { modelConfig?: any; dataSources?: any[]; etlOptions?: any; }
  ) {
    const inSample: DataSample = { format: 'json', schema: this.extractSchema(inputSample), data: inputSample };
    const outSample: DataSample = { format: 'json', schema: this.extractSchema(outputSample), data: outputSample };
    const pipeline = await this.pipelineEngine.createPipeline(name, inSample, outSample, options);
    this.currentPipelineId = pipeline.id;
    this.updateData(this.pipelineToMindMap(pipeline));
    this.config.onPipelineCreated?.(pipeline);
    return pipeline;
  }

  async updatePipelineInput(newInput: any) {
    if (!this.currentPipelineId) throw new Error('No active pipeline to update');
    const ds: DataSample = { format: 'json', schema: this.extractSchema(newInput), data: newInput };
    const p = await this.pipelineEngine.updatePipeline(this.currentPipelineId, ds, undefined);
    this.updateData(this.pipelineToMindMap(p));
    return p;
  }

  async updatePipelineOutput(newOutput: any) {
    if (!this.currentPipelineId) throw new Error('No active pipeline to update');
    const ds: DataSample = { format: 'json', schema: this.extractSchema(newOutput), data: newOutput };
    const p = await this.pipelineEngine.updatePipeline(this.currentPipelineId, undefined, ds);
    this.updateData(this.pipelineToMindMap(p));
    return p;
  }

  executePipeline(inputData: any) {
    if (!this.currentPipelineId) throw new Error('No active pipeline to execute');
    const result = this.pipelineEngine.executePipeline(this.currentPipelineId, inputData);
    this.config.onDataTransformed?.(result);
    return result;
  }

  getAllPipelines() { return this.pipelineEngine.getAllPipelines(); }
  switchToPipeline(pipelineId: string) {
    const p = this.pipelineEngine.getPipeline(pipelineId);
    if (!p) throw new Error(`Pipeline ${pipelineId} not found`);
    this.currentPipelineId = pipelineId;
    this.updateData(this.pipelineToMindMap(p));
  }

  private extractSchema(data: any): any {
    if (Array.isArray(data)) return data.length ? this.extractSchema(data[0]) : {};
    if (typeof data === 'object' && data) {
      const s: any = {}; for (const [k, v] of Object.entries(data)) s[k] = typeof v; return s;
    }
    return typeof data;
  }

  private pipelineToMindMap(pipeline: PipelineConfig): MindMapNode {
    const children: MindMapNode[] = [];
    const mode = this.pipelineEngine.getPipelineExecutionMode(pipeline.id);
    const isStatic = this.pipelineEngine.isPipelineStatic(pipeline.id);
    children.push({
      topic: 'Execution Mode',
      summary: isStatic ? 'Static compiled execution (ML-free)' : 'Dynamic execution',
      skills: [`Mode: ${String(mode).toUpperCase()}`]
    });
    if (pipeline.dataSources?.length) {
      children.push({
        topic: 'Data Sources',
        summary: `${pipeline.dataSources.length} connected sources`,
        children: pipeline.dataSources.map((s: any) => ({
          topic: s.type.toUpperCase(),
          summary: `${(s.connection.host || s.connection.apiEndpoint || 'Local')}`,
          skills: [`Polling: ${s.polling?.interval ?? 'realtime'}ms`]
        }))
      });
    }
    children.push({
      topic: 'Input Schema',
      summary: 'Data input configuration',
      skills: Object.keys(pipeline.inputSample.schema ?? {})
    });
    children.push({
      topic: 'Transformations',
      summary: `${pipeline.transformationRules.length} rules`,
      children: pipeline.transformationRules.map((r: any) => ({
        topic: `${r.sourceField} → ${r.targetField}`,
        summary: `${r.type} (${Math.round((r.confidence ?? 0) * 100)}%)`
      }))
    });
    children.push({
      topic: 'Output Schema',
      summary: 'Data output configuration',
      skills: Object.keys(pipeline.outputSample.schema ?? {})
    });
    return {
      topic: pipeline.name,
      summary: `ETL Pipeline - Accuracy: ${(pipeline.accuracy * 100).toFixed(1)}%`,
      skills: [`Version: ${pipeline.version}`],
      children
    };
  }
}

export default NodeQMindMap;
export { PipelineEngine };