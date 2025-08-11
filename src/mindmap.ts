import { MindMapNode } from './types';

export class JsonSchemaAdapter {
  static convertToStandard(data: any): MindMapNode {
    if (!data || typeof data !== 'object') {
      return {
        topic: 'Invalid Data',
        summary: 'Unable to process the provided data',
        skills: ['error']
      };
    }

    // Extract basic properties
    const topic = data.topic || data.title || data.name || data.label || 'Unnamed Node';
    const summary = data.summary || data.description || data.details || undefined;
    const skills = this.extractSkills(data);
    const children = this.extractChildren(data);

    const result: MindMapNode = {
      topic,
      summary,
      skills,
      children: children ? children.map(child => this.convertToStandard(child)) : undefined
    };

    // Add any additional properties
    const excludedKeys = ['topic', 'title', 'name', 'label', 'summary', 'description', 'details', 'skills', 'tags', 'categories', 'keywords', 'attributes', 'children', 'items', 'nodes', 'subitems', 'elements', 'branches'];

    Object.keys(data).forEach(key => {
      if (!excludedKeys.includes(key)) {
        result[key] = data[key];
      }
    });

    return result;
  }

  private static extractSkills(obj: any): string[] | undefined {
    const skillFields = ['skills', 'tags', 'categories', 'keywords', 'attributes'];
    for (const field of skillFields) {
      if (Array.isArray(obj[field])) {
        return obj[field].filter((item: any) => typeof item === 'string');
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