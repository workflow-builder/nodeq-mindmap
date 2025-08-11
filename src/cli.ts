#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { PipelineEngine } from './pipeline-engine';
import { NodeQMindMap } from './index';
import { ensureDom } from './utils/dom';

const program = new Command();
const pipelineEngine = new PipelineEngine();

program
  .name('nodeq-mindmap')
  .description('NodeQ MindMap with Data Pipeline capabilities')
  .version('2.0.0');

// Original mindmap functionality
program
  .command('generate')
  .description('Generate mindmap from JSON data')
  .requiredOption('-i, --input <file>', 'Input JSON file')
  .requiredOption('-o, --output <file>', 'Output SVG file')
  .option('-w, --width <number>', 'SVG width', '800')
  .option('-h, --height <number>', 'SVG height', '600')
  .action(async (options) => {
    try {
      ensureDom();
      const inputData = JSON.parse(readFileSync(options.input, 'utf8'));

      const mindMap = new NodeQMindMap({
        container: '#root',
        data: inputData,
        width: parseInt(options.width),
        height: parseInt(options.height),
        interactive: false,
        zoomable: false,
        collapsible: false
      });

      mindMap.render(); // necessary before export
      const svg = mindMap.exportSVG();
      writeFileSync(options.output, svg);
      console.log(`Mindmap generated: ${options.output}`);
    } catch (error) {
      console.error('Error generating mindmap:', error);
      process.exit(1);
    }
  });

// Pipeline commands
program
  .command('create-pipeline')
  .description('Create a new data pipeline')
  .requiredOption('-n, --name <name>', 'Pipeline name')
  .requiredOption('-i, --input <file>', 'Input sample JSON file')
  .requiredOption('-o, --output <file>', 'Output sample JSON file')
  .option('-m, --model <type>', 'Model type (tensorflow|huggingface|openai|custom|built-in)', 'built-in')
  .action(async (options) => {
    try {
      const inputSample = JSON.parse(readFileSync(options.input, 'utf8'));
      const outputSample = JSON.parse(readFileSync(options.output, 'utf8'));

      const pipeline = await pipelineEngine.createPipeline(
        options.name,
        { format: 'json', schema: extractSchema(inputSample), data: inputSample },
        { format: 'json', schema: extractSchema(outputSample), data: outputSample },
        { modelConfig: { type: options.model } }
      );

      console.log('✅ Pipeline created:', pipeline.id);
      console.log('📊 Accuracy:', (pipeline.accuracy * 100).toFixed(1) + '%');
    } catch (error) {
      console.error('Error creating pipeline:', error);
      process.exit(1);
    }
  });

function extractSchema(data: any): any {
  if (Array.isArray(data)) {
    return data.length > 0 ? extractSchema(data[0]) : {};
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

program.parse();