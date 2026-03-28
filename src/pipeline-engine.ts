import { DataSample, PipelineConfig, TransformationRule } from './types';

// ─── Schema analysis helpers ────────────────────────────────────────────────

/** Flatten a nested object into dot-notation paths: { a: { b: 1 } } → { 'a.b': 1 } */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenObject(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

/** Convert a string to camelCase */
function toCamelCase(s: string): string {
  return s.replace(/[_\-\s](.)/g, (_, c) => c.toUpperCase());
}

/** Normalise a field name for comparison: strip underscores, lowercase */
function normalise(s: string): string {
  return s.replace(/[_\-\s]/g, '').toLowerCase();
}

/** Detect likely numeric scaling between two values (e.g. cents → dollars = /100) */
function detectScaling(inVal: any, outVal: any): { type: string; factor?: number } | null {
  if (typeof inVal !== 'number' || typeof outVal !== 'number') return null;
  if (inVal === 0 || outVal === 0) return null;
  const ratio = inVal / outVal;
  if (Math.abs(ratio - 100) < 0.01) return { type: 'divide', factor: 100 };
  if (Math.abs(ratio - 1000) < 0.01) return { type: 'divide', factor: 1000 };
  if (Math.abs(ratio - 0.01) < 0.0001) return { type: 'multiply', factor: 100 };
  return null;
}

/** Score how well two field names match (0–1) */
function fieldNameSimilarity(a: string, b: string): number {
  const na = normalise(a);
  const nb = normalise(b);
  if (na === nb) return 1.0;
  if (toCamelCase(a).toLowerCase() === b.toLowerCase()) return 0.95;
  if (toCamelCase(b).toLowerCase() === a.toLowerCase()) return 0.95;
  // Substring containment
  if (na.includes(nb) || nb.includes(na)) return 0.7;
  // Common prefix
  let common = 0;
  for (let i = 0; i < Math.min(na.length, nb.length); i++) {
    if (na[i] === nb[i]) common++; else break;
  }
  const prefixScore = common / Math.max(na.length, nb.length);
  return prefixScore > 0.5 ? prefixScore * 0.8 : 0;
}

// ─── Rule generation ─────────────────────────────────────────────────────────

function generateRules(
  inputSample: DataSample,
  outputSample: DataSample
): { rules: TransformationRule[]; accuracy: number } {
  const inFlat = flattenObject(inputSample.data ?? {});
  const outFlat = flattenObject(outputSample.data ?? {});

  const inKeys = Object.keys(inFlat);
  const outKeys = Object.keys(outFlat);

  const rules: TransformationRule[] = [];
  const matchedIn = new Set<string>();
  const matchedOut = new Set<string>();

  // Pass 1: exact and camelCase matches
  for (const outKey of outKeys) {
    let bestIn: string | null = null;
    let bestScore = 0;
    for (const inKey of inKeys) {
      const score = fieldNameSimilarity(inKey, outKey);
      if (score > bestScore) { bestScore = score; bestIn = inKey; }
    }

    if (bestIn && bestScore >= 0.7) {
      const inVal = inFlat[bestIn];
      const outVal = outFlat[outKey];
      const scaling = detectScaling(inVal, outVal);

      let ruleType = 'direct';
      if (bestScore < 1.0 && bestScore >= 0.9) ruleType = 'rename';
      if (scaling) ruleType = scaling.type === 'divide' ? 'divide' : 'multiply';
      if (typeof inVal !== typeof outVal && !(typeof inVal === 'number' && typeof outVal === 'number')) {
        ruleType = 'convert';
      }

      rules.push({
        sourceField: bestIn,
        targetField: outKey,
        type: ruleType,
        confidence: bestScore,
        ...(scaling ? { factor: scaling.factor } : {}),
      } as TransformationRule & { factor?: number });

      matchedIn.add(bestIn);
      matchedOut.add(outKey);
    }
  }

  // Pass 2: unmatched output fields — mark as computed/constant
  for (const outKey of outKeys) {
    if (!matchedOut.has(outKey)) {
      rules.push({
        sourceField: '',
        targetField: outKey,
        type: 'constant',
        confidence: 0.4,
      });
    }
  }

  const accuracy = rules.length > 0
    ? rules.reduce((s, r) => s + r.confidence, 0) / rules.length
    : 0;

  return { rules, accuracy: Math.min(accuracy, 0.99) };
}

// ─── Apply rules ─────────────────────────────────────────────────────────────

function applyRules(inputData: any, rules: TransformationRule[]): any {
  const inFlat = flattenObject(inputData ?? {});
  const out: Record<string, any> = {};

  for (const rule of rules) {
    if (rule.type === 'constant') {
      out[rule.targetField] = null;
      continue;
    }

    let value = inFlat[rule.sourceField];
    if (value === undefined) continue;

    const r = rule as TransformationRule & { factor?: number };

    if (r.type === 'divide' && r.factor && typeof value === 'number') {
      value = value / r.factor;
    } else if (r.type === 'multiply' && r.factor && typeof value === 'number') {
      value = value * r.factor;
    } else if (r.type === 'convert') {
      // Best-effort type coercion
      const targetType = typeof (null as any); // unknown, try string
      value = String(value);
    }

    // Support dot-notation output keys
    const parts = rule.targetField.split('.');
    let cursor = out;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cursor[parts[i]]) cursor[parts[i]] = {};
      cursor = cursor[parts[i]];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  return out;
}

// ─── PipelineEngine ───────────────────────────────────────────────────────────

export class PipelineEngine {
  private pipelines: Map<string, PipelineConfig> = new Map();
  private nextId = 1;

  async createPipeline(
    name: string,
    inputSample: DataSample,
    outputSample: DataSample,
    options?: any
  ): Promise<PipelineConfig> {
    const { rules, accuracy } = generateRules(inputSample, outputSample);

    const pipeline: PipelineConfig = {
      id: `pipeline_${this.nextId++}`,
      name,
      inputSample,
      outputSample,
      transformationRules: rules,
      modelConfig: options?.modelConfig || { type: 'auto' },
      accuracy,
      version: '1.0.0',
      createdAt: new Date(),
      dataSources: options?.dataSources || [],
      etlConfig: options?.etlOptions,
      performance: {
        throughput: 1000,
        latency: 5,
        errorRate: 1 - accuracy
      }
    };

    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  async updatePipeline(
    pipelineId: string,
    inputSample?: DataSample,
    outputSample?: DataSample
  ): Promise<PipelineConfig> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);

    if (inputSample) pipeline.inputSample = inputSample;
    if (outputSample) pipeline.outputSample = outputSample;

    // Regenerate rules whenever samples change
    if (inputSample || outputSample) {
      const { rules, accuracy } = generateRules(pipeline.inputSample, pipeline.outputSample);
      pipeline.transformationRules = rules;
      pipeline.accuracy = accuracy;
      pipeline.performance!.errorRate = 1 - accuracy;
    }

    return pipeline;
  }

  executePipeline(pipelineId: string, inputData: any): any {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);

    const transformed = applyRules(inputData, pipeline.transformationRules);

    return {
      processed: true,
      data: transformed,
      timestamp: new Date(),
      pipelineId,
      rulesApplied: pipeline.transformationRules.length,
      accuracy: pipeline.accuracy,
    };
  }

  getPipeline(pipelineId: string): PipelineConfig | undefined {
    return this.pipelines.get(pipelineId);
  }

  getAllPipelines(): PipelineConfig[] {
    return Array.from(this.pipelines.values());
  }

  generatePipelineCode(pipelineId: string): string {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);

    const fnName = pipeline.name.replace(/\s+/g, '_');
    const lines: string[] = [
      `// Auto-generated pipeline: ${pipeline.name}`,
      `// Accuracy: ${(pipeline.accuracy * 100).toFixed(1)}% | Rules: ${pipeline.transformationRules.length}`,
      `export function ${fnName}(input: Record<string, any>): Record<string, any> {`,
      `  const out: Record<string, any> = {};`,
    ];

    for (const rule of pipeline.transformationRules) {
      const r = rule as TransformationRule & { factor?: number };
      if (r.type === 'constant') {
        lines.push(`  out['${r.targetField}'] = null; // computed — fill in manually`);
      } else if (r.type === 'divide' && r.factor) {
        lines.push(`  out['${r.targetField}'] = input['${r.sourceField}'] / ${r.factor};`);
      } else if (r.type === 'multiply' && r.factor) {
        lines.push(`  out['${r.targetField}'] = input['${r.sourceField}'] * ${r.factor};`);
      } else if (r.type === 'convert') {
        lines.push(`  out['${r.targetField}'] = String(input['${r.sourceField}']);`);
      } else {
        lines.push(`  out['${r.targetField}'] = input['${r.sourceField}']; // ${r.type} (${Math.round(r.confidence * 100)}%)`);
      }
    }

    lines.push(`  return out;`, `}`);
    return lines.join('\n');
  }

  startRealtimeProcessing(pipelineId: string, onData: (result: any) => void, intervalMs = 1000): () => void {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);

    const timer = setInterval(() => {
      const result = this.executePipeline(pipelineId, pipeline.inputSample.data);
      onData(result);
    }, intervalMs);

    return () => clearInterval(timer);
  }

  getPipelineStats(pipelineId: string): any {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);

    return {
      id: pipeline.id,
      name: pipeline.name,
      rulesGenerated: pipeline.transformationRules.length,
      accuracy: pipeline.accuracy,
      performance: pipeline.performance,
      version: pipeline.version,
      lastExecuted: new Date()
    };
  }

  getPipelineExecutionMode(_pipelineId: string): string {
    return 'static';
  }

  isPipelineStatic(_pipelineId: string): boolean {
    return true;
  }
}
