import { MindMapNode, Theme } from './types';
import * as d3 from 'd3';

// Assuming JsonSchemaAdapter is defined and exported elsewhere or data is already in MindMapNode format.
// For demonstration, let's include a placeholder if it's not provided.
// If JsonSchemaAdapter is in a separate file and needs to be imported, uncomment the line below:
// import { JsonSchemaAdapter } from './jsonSchemaAdapter';

export class NodeQMindMap {
  private config: {
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
  };

  constructor(config: any) {
    this.config = {
      container: config.container,
      data: config.data,
      width: config.width ?? 800,
      height: config.height ?? 600,
      theme: {
        nodeColor: config.theme?.nodeColor ?? '#4299e1',
        textColor: config.theme?.textColor ?? '#2d3748',
        linkColor: config.theme?.linkColor ?? '#a0aec0',
        backgroundColor: config.theme?.backgroundColor ?? '#ffffff',
        fontSize: config.theme?.fontSize ?? 14,
        fontFamily: config.theme?.fontFamily ?? 'Arial, sans-serif'
      },
      interactive: config.interactive ?? true,
      zoomable: config.zoomable ?? true,
      collapsible: config.collapsible ?? true,
      nodeSpacing: config.nodeSpacing ?? 200,
      levelSpacing: config.levelSpacing ?? 300,
      onNodeClick: config.onNodeClick ?? (() => {}),
      onNodeHover: config.onNodeHover ?? (() => {})
    };
  }

  public render(): void {
    if (!this.config.container) {
      console.error('Container element is not provided.');
      return;
    }

    const container = typeof this.config.container === 'string'
      ? document.querySelector(this.config.container)
      : this.config.container;

    if (!container) {
      console.error('Container element not found.');
      return;
    }

    d3.select(container).selectAll('*').remove(); // Clear previous content

    const svg = d3.select(container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .style('background-color', this.config.theme.backgroundColor);

    const g = svg.append('g')
      .attr('transform', `translate(${this.config.width / 2}, ${this.config.height / 2})`);

    if (!this.config.data) {
      console.warn('No data provided for rendering.');
      return;
    }

    // Convert data to the MindMapNode structure if it's not already
    // const mindMapData = JsonSchemaAdapter.convertToStandard(this.config.data);
    const mindMapData = this.config.data; // Directly use data if it's already in the correct format

    const rootNode = d3.hierarchy(mindMapData);

    // Tree layout
    const treeLayout = d3.tree<MindMapNode>().size([this.config.height, this.config.width]);
    const treeData = treeLayout(rootNode);

    // Nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y}, ${d.x})`);

    nodes.append('circle')
      .attr('r', 10)
      .style('fill', this.config.theme.nodeColor)
      .style('stroke', this.config.theme.linkColor)
      .style('stroke-width', '2px');

    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -13 : 13)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-size', `${this.config.theme.fontSize}px`)
      .style('font-family', this.config.theme.fontFamily)
      .style('fill', this.config.theme.textColor)
      .text(d => d.data.topic);

    // Links
    const links = g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        const linkGen = d3.linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x);
        return linkGen(d);
      })
      .style('fill', 'none')
      .style('stroke', this.config.theme.linkColor)
      .style('stroke-width', '2px');

    // Interactivity
    if (this.config.interactive) {
      nodes
        .on('click', (event, d) => {
          this.config.onNodeClick(d.data);
          if (this.config.collapsible) {
            // Toggle children visibility
            if (d.children) {
              (d as any)._children = d.children;
              d.children = undefined;
            } else if ((d as any)._children) {
              d.children = (d as any)._children;
              (d as any)._children = undefined;
            }
            this.render(); // Re-render on collapse/expand
          }
        })
        .on('mouseover', (event, d) => {
          this.config.onNodeHover(d.data);
          d3.select(event.currentTarget).select('circle').style('fill', '#ff0000'); // Example hover effect
        })
        .on('mouseout', (event, d) => {
          d3.select(event.currentTarget).select('circle').style('fill', this.config.theme.nodeColor); // Reset fill
        });
    }

    // Zooming
    if (this.config.zoomable) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 5])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });
      svg.call(zoom);
    }
  }

  // Helper methods for collapse/expand logic
  private hasChildren(node: d3.HierarchyNode<MindMapNode>): boolean {
    // Check if the node has children data and if that array is not empty
    return !!node.data && !!node.data.children && node.data.children.length > 0;
  }

  private getChildren(node: d3.HierarchyNode<MindMapNode>): d3.HierarchyNode<MindMapNode>[] | null {
    // Ensure children exist and map them to HierarchyNode structure
    return node.data.children ? node.data.children.map((child: MindMapNode) => d3.hierarchy(child)) : null;
  }
}