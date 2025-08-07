import * as d3 from 'd3';

export interface MindMapNode {
  topic: string;
  summary?: string;
  skills?: string[];
  children?: MindMapNode[];
  [key: string]: any;
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
}

export default NodeQMindMap;