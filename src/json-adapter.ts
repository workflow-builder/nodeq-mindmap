import { MindMapNode } from './types';

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