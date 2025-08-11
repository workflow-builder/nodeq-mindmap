
#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { PipelineEngine, DataSample } from './pipeline-engine';
import { NodeQMindMap } from './index';

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
      const inputData = JSON.parse(readFileSync(options.input, 'utf8'));
      
      const mindMap = new NodeQMindMap({
        container: 'body', // Will be handled differently in CLI
        data: inputData,
        width: parseInt(options.width),
        height: parseInt(options.height)
      });

      const svg = mindMap.exportSVG();
      writeFileSync(options.output, svg);
      console.log(`Mindmap generated: ${options.output}`);
    } catch (error) {
      console.error('Error generating mindmap:', error);
      process.exit(1);
    }
  });

// Pipeline commands
const pipelineCmd = program
  .command('pipeline')
  .description('Data pipeline operations');

pipelineCmd
  .command('create')
  .description('Create a new data pipeline')
  .requiredOption('-i, --input <file>', 'Input sample file')
  .requiredOption('-o, --output <file>', 'Output sample file')
  .requiredOption('-n, --name <name>', 'Pipeline name')
  .option('--format <format>', 'Data format (json, csv)', 'json')
  .action(async (options) => {
    try {
      const inputData = JSON.parse(readFileSync(options.input, 'utf8'));
      const outputData = JSON.parse(readFileSync(options.output, 'utf8'));

      const inputSample: DataSample = {
        format: options.format,
        schema: extractSchema(inputData),
        data: inputData
      };

      const outputSample: DataSample = {
        format: options.format,
        schema: extractSchema(outputData),
        data: outputData
      };

      const pipeline = await pipelineEngine.createPipeline(
        options.name,
        inputSample,
        outputSample
      );

      console.log(`Pipeline created: ${pipeline.id}`);
      console.log(`Accuracy: ${(pipeline.accuracy * 100).toFixed(1)}%`);
      console.log(`Transformation rules: ${pipeline.transformationRules.length}`);
      
      // Save pipeline config
      const configFile = `${options.name.replace(/\s+/g, '-').toLowerCase()}-pipeline.json`;
      writeFileSync(configFile, JSON.stringify(pipeline, null, 2));
      console.log(`Pipeline config saved: ${configFile}`);
    } catch (error) {
      console.error('Error creating pipeline:', error);
      process.exit(1);
    }
  });

pipelineCmd
  .command('update')
  .description('Update an existing pipeline')
  .requiredOption('-n, --name <name>', 'Pipeline name')
  .option('-i, --input <file>', 'New input sample file')
  .option('-o, --output <file>', 'New output sample file')
  .action(async (options) => {
    try {
      const configFile = `${options.name.replace(/\s+/g, '-').toLowerCase()}-pipeline.json`;
      const pipeline = JSON.parse(readFileSync(configFile, 'utf8'));

      let newInputSample: DataSample | undefined;
      let newOutputSample: DataSample | undefined;

      if (options.input) {
        const inputData = JSON.parse(readFileSync(options.input, 'utf8'));
        newInputSample = {
          format: 'json',
          schema: extractSchema(inputData),
          data: inputData
        };
      }

      if (options.output) {
        const outputData = JSON.parse(readFileSync(options.output, 'utf8'));
        newOutputSample = {
          format: 'json',
          schema: extractSchema(outputData),
          data: outputData
        };
      }

      const updatedPipeline = await pipelineEngine.updatePipeline(
        pipeline.id,
        newInputSample,
        newOutputSample
      );

      console.log(`Pipeline updated: ${updatedPipeline.id}`);
      console.log(`New accuracy: ${(updatedPipeline.accuracy * 100).toFixed(1)}%`);
      console.log(`Version: ${updatedPipeline.version}`);

      writeFileSync(configFile, JSON.stringify(updatedPipeline, null, 2));
      console.log(`Pipeline config updated: ${configFile}`);
    } catch (error) {
      console.error('Error updating pipeline:', error);
      process.exit(1);
    }
  });

pipelineCmd
  .command('execute')
  .description('Execute a pipeline with input data')
  .requiredOption('-n, --name <name>', 'Pipeline name')
  .requiredOption('-d, --data <file>', 'Input data file')
  .option('-o, --output <file>', 'Output file (optional)')
  .action(async (options) => {
    try {
      const configFile = `${options.name.replace(/\s+/g, '-').toLowerCase()}-pipeline.json`;
      const pipeline = JSON.parse(readFileSync(configFile, 'utf8'));
      const inputData = JSON.parse(readFileSync(options.data, 'utf8'));

      const result = pipelineEngine.executePipeline(pipeline.id, inputData);

      if (options.output) {
        writeFileSync(options.output, JSON.stringify(result, null, 2));
        console.log(`Result saved to: ${options.output}`);
      } else {
        console.log('Transformation result:');
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error executing pipeline:', error);
      process.exit(1);
    }
  });

pipelineCmd
  .command('list')
  .description('List all pipelines')
  .action(() => {
    try {
      const pipelines = pipelineEngine.getAllPipelines();
      
      if (pipelines.length === 0) {
        console.log('No pipelines found');
        return;
      }

      console.log('Available pipelines:');
      pipelines.forEach(pipeline => {
        console.log(`- ${pipeline.name} (${pipeline.id})`);
        console.log(`  Accuracy: ${(pipeline.accuracy * 100).toFixed(1)}%`);
        console.log(`  Created: ${pipeline.createdAt.toLocaleDateString()}`);
        console.log(`  Rules: ${pipeline.transformationRules.length}`);
        console.log('');
      });
    } catch (error) {
      console.error('Error listing pipelines:', error);
      process.exit(1);
    }
  });

pipelineCmd
  .command('export')
  .description('Export pipeline as executable code')
  .requiredOption('-n, --name <name>', 'Pipeline name')
  .option('-f, --format <format>', 'Export format (js, ts)', 'js')
  .option('-o, --output <file>', 'Output file')
  .action(async (options) => {
    try {
      const configFile = `${options.name.replace(/\s+/g, '-').toLowerCase()}-pipeline.json`;
      const pipeline = JSON.parse(readFileSync(configFile, 'utf8'));

      const code = pipelineEngine.generatePipelineCode(pipeline.id);
      
      const outputFile = options.output || 
        `${options.name.replace(/\s+/g, '-').toLowerCase()}-transform.${options.format}`;

      writeFileSync(outputFile, code);
      console.log(`Pipeline code exported: ${outputFile}`);
    } catch (error) {
      console.error('Error exporting pipeline:', error);
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
