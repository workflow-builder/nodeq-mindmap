import * as d3 from 'd3';
import { MindMapNode, NodeQConfig } from './types';
import { JsonSchemaAdapter } from './json-adapter';

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
    this.g.selectAll('.link')
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
      .attr('transform', d => `translate(${d.y + 100},${d.x + 50})`);

    // Add node circles
    nodes.append('circle')
      .attr('r', 8)
      .style('fill', this.config.theme.nodeColor)
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    // Add node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -13 : 13)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-family', this.config.theme.fontFamily)
      .style('font-size', `${this.config.theme.fontSize}px`)
      .style('fill', this.config.theme.textColor)
      .text(d => d.data.topic);

    // Add interactivity
    if (this.config.interactive) {
      nodes
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          this.config.onNodeClick(d.data);
        })
        .on('mouseover', (event, d) => {
          this.config.onNodeHover(d.data);
        });
    }
  }
}