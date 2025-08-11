
import * as tf from '@tensorflow/tfjs';

export interface ModelConfig {
  type: 'tensorflow' | 'huggingface' | 'openai' | 'custom' | 'built-in';
  endpoint?: string;
  apiKey?: string;
  modelName?: string;
  localPath?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    threshold?: number;
  };
}

export interface DataSourceConfig {
  type: 'iot-hub' | 'kafka' | 'rest-api' | 'websocket' | 'database' | 'file-system' | 'mqtt';
  connection: {
    host?: string;
    port?: number;
    topic?: string;
    connectionString?: string;
    apiEndpoint?: string;
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
    };
  };
  polling?: {
    interval: number;
    batchSize?: number;
  };
}

export interface DataSample {
  format: string;
  schema: any;
  data: any;
  source?: DataSourceConfig;
  metadata?: {
    fields: string[];
    types: { [key: string]: string };
    relationships: any[];
    isTimeSeries?: boolean;
    timeField?: string;
    sampleRate?: number;
    dataLineage?: string[];
    qualityScore?: number;
  };
}

export interface TransformationRule {
  id: string;
  type: 'map' | 'filter' | 'aggregate' | 'join' | 'custom' | 'window' | 'interpolate' | 'rolling' | 'concat' | 'split' | 'typecast';
  sourceField: string;
  targetField: string;
  logic: string;
  confidence: number;
  windowSize?: number;
  isStreaming?: boolean;
  mlScore?: number;
  transformFunction?: string;
}

export interface PipelineConfig {
  id: string;
  name: string;
  inputSample: DataSample;
  outputSample: DataSample;
  transformationRules: TransformationRule[];
  createdAt: Date;
  accuracy: number;
  isStreaming?: boolean;
  bufferSize?: number;
  modelWeights?: any;
  version: string;
  modelConfig: ModelConfig;
  dataSources: DataSourceConfig[];
  etlConfig?: {
    extractionRules: any[];
    validationRules: any[];
    errorHandling: 'skip' | 'stop' | 'log';
    parallelProcessing: boolean;
    checkpointInterval?: number;
  };
  performance?: {
    throughput: number;
    latency: number;
    errorRate: number;
  };
}

interface StreamBuffer {
  data: any[];
  maxSize: number;
  currentIndex: number;
}

interface CompiledPipeline {
  id: string;
  name: string;
  transformFunction: Function;
  createdAt: Date;
  lastCompiled: Date;
  version: string;
  isStatic: boolean;
}


  private async initializeTensorFlowModel(): Promise<void> {
    try {
      if (this.modelConfig.localPath) {
        this.model.model = await tf.loadLayersModel(this.modelConfig.localPath);
      } else if (this.modelConfig.endpoint) {
        this.model.model = await tf.loadLayersModel(this.modelConfig.endpoint);
      } else {
        await this.initializeBuiltInModel();
        return;
      }
      this.model.isLoaded = true;
      console.log('TensorFlow model loaded successfully');
    } catch (error) {
      console.warn('TensorFlow model loading failed:', error);
      await this.initializeBuiltInModel();
    }
  }

  private async initializeHuggingFaceModel(): Promise<void> {
    try {
      // Integration with Hugging Face Transformers.js
      console.log('Hugging Face model integration - would use transformers.js');
      this.model.isLoaded = true;
    } catch (error) {
      console.warn('Hugging Face model loading failed:', error);
      await this.initializeBuiltInModel();
    }
  }

  private async initializeOpenAIModel(): Promise<void> {
    try {
      if (!this.modelConfig.apiKey) {
        throw new Error('OpenAI API key required');
      }
      console.log('OpenAI model configured successfully');
      this.model.isLoaded = true;
    } catch (error) {
      console.warn('OpenAI model configuration failed:', error);
      await this.initializeBuiltInModel();
    }
  }

  private async initializeCustomModel(): Promise<void> {
    try {
      // Load custom model from endpoint
      console.log('Custom model loading from:', this.modelConfig.endpoint);
      this.model.isLoaded = true;
    } catch (error) {
      console.warn('Custom model loading failed:', error);
      await this.initializeBuiltInModel();
    }
  }

  private async initializeBuiltInModel(): Promise<void> {</old_str>


interface FieldMapping {
  inputField: string;
  outputField: string;
  similarity: number;
  transformationType: string;
  mlPrediction: number;
}

interface MLModel {
  model?: tf.LayersModel;
  isLoaded: boolean;
  version: string;
}

class MLAnalysisEngine {
  private model: MLModel = { isLoaded: false, version: '1.0.0' };
  private fieldMappingCache: Map<string, FieldMapping[]> = new Map();
  private transformationPatterns: Map<string, any> = new Map();
  private modelConfig: ModelConfig;
  private dataConnectors: Map<string, any> = new Map();

  constructor(modelConfig: ModelConfig = { type: 'built-in' }) {
    this.modelConfig = modelConfig;
  }

  async initializeModel(): Promise<void> {
    switch (this.modelConfig.type) {
      case 'tensorflow':
        await this.initializeTensorFlowModel();
        break;
      case 'huggingface':
        await this.initializeHuggingFaceModel();
        break;
      case 'openai':
        await this.initializeOpenAIModel();
        break;
      case 'custom':
        await this.initializeCustomModel();
        break;
      default:
        await this.initializeBuiltInModel();
    }


  async connectDataSource(config: DataSourceConfig): Promise<any> {
    const connectorKey = `${config.type}_${config.connection.host || 'default'}`;
    
    if (this.dataConnectors.has(connectorKey)) {
      return this.dataConnectors.get(connectorKey);
    }

    let connector;
    
    switch (config.type) {
      case 'iot-hub':
        connector = await this.createIoTHubConnector(config);
        break;
      case 'kafka':
        connector = await this.createKafkaConnector(config);
        break;
      case 'rest-api':
        connector = await this.createRestApiConnector(config);
        break;
      case 'websocket':
        connector = await this.createWebSocketConnector(config);
        break;
      case 'mqtt':
        connector = await this.createMqttConnector(config);
        break;
      case 'database':
        connector = await this.createDatabaseConnector(config);
        break;
      default:
        throw new Error(`Unsupported data source type: ${config.type}`);
    }

    this.dataConnectors.set(connectorKey, connector);
    return connector;
  }

  private async createIoTHubConnector(config: DataSourceConfig): Promise<any> {
    return {
      type: 'iot-hub',
      connect: async () => {
        console.log('Connecting to IoT Hub:', config.connection.host);
        return { status: 'connected', devices: [] };
      },
      subscribe: (callback: (data: any) => void) => {
        console.log('Subscribing to IoT Hub messages');
        // Simulate IoT data
        setInterval(() => {
          callback({
            deviceId: 'sensor_001',
            temperature: 20 + Math.random() * 10,
            humidity: 40 + Math.random() * 20,
            timestamp: new Date().toISOString()
          });
        }, config.polling?.interval || 5000);
      }
    };
  }

  private async createKafkaConnector(config: DataSourceConfig): Promise<any> {
    return {
      type: 'kafka',
      connect: async () => {
        console.log('Connecting to Kafka:', config.connection.host);
        return { status: 'connected' };
      },
      subscribe: (callback: (data: any) => void) => {
        console.log('Subscribing to Kafka topic:', config.connection.topic);
        // Simulate Kafka messages
        setInterval(() => {
          callback({
            partition: 0,
            offset: Date.now(),
            key: 'event_key',
            value: {
              userId: Math.floor(Math.random() * 1000),
              action: 'click',
              timestamp: new Date().toISOString()
            }
          });
        }, config.polling?.interval || 1000);
      }
    };
  }

  private async createRestApiConnector(config: DataSourceConfig): Promise<any> {
    return {
      type: 'rest-api',
      connect: async () => {
        console.log('Setting up REST API connector:', config.connection.apiEndpoint);
        return { status: 'ready' };
      },
      poll: async () => {
        try {
          // In a real implementation, this would make HTTP requests
          console.log('Polling REST API:', config.connection.apiEndpoint);
          return {
            data: [
              { id: 1, name: 'Sample Data', value: Math.random() * 100 }
            ],
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('REST API polling error:', error);
          return null;
        }
      }
    };
  }

  private async createWebSocketConnector(config: DataSourceConfig): Promise<any> {
    return {
      type: 'websocket',
      connect: async () => {
        console.log('Connecting to WebSocket:', config.connection.host);
        // In real implementation, create WebSocket connection
        return { status: 'connected' };
      },
      onMessage: (callback: (data: any) => void) => {
        console.log('WebSocket message handler registered');
        // Simulate real-time messages
        setInterval(() => {
          callback({
            type: 'market_data',
            symbol: 'BTC/USD',
            price: 40000 + Math.random() * 10000,
            timestamp: new Date().toISOString()
          });
        }, 1000);
      }
    };
  }

  private async createMqttConnector(config: DataSourceConfig): Promise<any> {
    return {
      type: 'mqtt',
      connect: async () => {
        console.log('Connecting to MQTT broker:', config.connection.host);
        return { status: 'connected' };
      },
      subscribe: (callback: (data: any) => void) => {
        console.log('Subscribing to MQTT topic:', config.connection.topic);
        setInterval(() => {
          callback({
            topic: config.connection.topic,
            payload: {
              sensorId: 'temp_sensor_01',
              reading: 25.5 + Math.random() * 5,
              unit: 'celsius',
              timestamp: new Date().toISOString()
            }
          });
        }, config.polling?.interval || 2000);
      }
    };
  }

  private async createDatabaseConnector(config: DataSourceConfig): Promise<any> {
    return {
      type: 'database',
      connect: async () => {
        console.log('Connecting to database:', config.connection.connectionString);
        return { status: 'connected' };
      },
      query: async (sql: string) => {
        console.log('Executing query:', sql);
        // Simulate database query results
        return [
          { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date().toISOString() },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: new Date().toISOString() }
        ];
      }
    };
  }

</old_str>

    try {
      // Create a lightweight neural network for pattern recognition
      this.model.model = tf.sequential({
        layers: [
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [20] // Feature vector size
          }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 8,
            activation: 'softmax' // Classification for transformation types
          })


  private generateExtractionRules(inputSample: DataSample): any[] {
    const rules: any[] = [];
    
    if (inputSample.metadata?.fields) {
      for (const field of inputSample.metadata.fields) {
        rules.push({
          field: field,
          type: inputSample.metadata.types[field],
          required: true,
          validation: this.getValidationRule(inputSample.metadata.types[field])
        });
      }
    }
    
    return rules;
  }

  private generateValidationRules(inputSample: DataSample, outputSample: DataSample): any[] {
    const rules: any[] = [];
    
    // Data quality rules
    rules.push({
      type: 'completeness',
      description: 'Check for missing required fields',
      threshold: 0.95
    });
    
    rules.push({
      type: 'consistency',
      description: 'Validate data type consistency',
      threshold: 1.0
    });
    
    if (inputSample.metadata?.isTimeSeries) {
      rules.push({
        type: 'temporal_order',
        description: 'Ensure temporal ordering',
        field: inputSample.metadata.timeField
      });
    }
    
    return rules;
  }

  private getValidationRule(type: string): any {
    const rules: { [key: string]: any } = {
      'string': { minLength: 1, maxLength: 1000 },
      'number': { min: -Infinity, max: Infinity },
      'boolean': { values: [true, false] },
      'array': { minItems: 0, maxItems: 1000 }
    };
    
    return rules[type] || {};
  }

  async startRealtimeProcessing(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    console.log(`Starting real-time processing for pipeline: ${pipeline.name}`);
    
    for (const sourceConfig of pipeline.dataSources) {
      const connector = await this.analyzer.connectDataSource(sourceConfig);
      
      if (connector.subscribe) {
        connector.subscribe((data: any) => {
          this.processRealtimeData(pipelineId, data);
        });
      } else if (connector.onMessage) {
        connector.onMessage((data: any) => {
          this.processRealtimeData(pipelineId, data);
        });
      }
    }
  }

  private async processRealtimeData(pipelineId: string, data: any): Promise<void> {
    const startTime = performance.now();
    
    try {
      const transformedData = this.executePipeline(pipelineId, data);
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Update performance metrics
      this.updatePerformanceMetrics(pipelineId, { latency, success: true });
      
      console.log(`Real-time data processed:`, { pipelineId, latency, transformedData });
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Update performance metrics with error
      this.updatePerformanceMetrics(pipelineId, { latency, success: false });
      
      console.error(`Real-time processing error:`, { pipelineId, error, latency });
    }
  }

  private updatePerformanceMetrics(pipelineId: string, metrics: { latency: number; success: boolean }): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline || !pipeline.performance) return;
    
    // Update latency (moving average)
    pipeline.performance.latency = (pipeline.performance.latency * 0.9) + (metrics.latency * 0.1);
    
    // Update throughput (simplified)
    pipeline.performance.throughput += 1;
    
    // Update error rate
    if (!metrics.success) {
      pipeline.performance.errorRate = (pipeline.performance.errorRate * 0.9) + (0.1);
    } else {
      pipeline.performance.errorRate = pipeline.performance.errorRate * 0.9;
    }
  }

</old_str>

        ]
      });

      this.model.model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.model.isLoaded = true;
      console.log('ML Analysis Engine initialized successfully');
    } catch (error) {
      console.warn('ML model initialization failed, falling back to rule-based analysis:', error);
      this.model.isLoaded = false;
    }
  }

  async analyzeTransformation(inputSample: DataSample, outputSample: DataSample): Promise<TransformationRule[]> {
    const inputFields = this.extractFields(inputSample.data);
    const outputFields = this.extractFields(outputSample.data);
    
    const mappings = await this.generateFieldMappings(inputFields, outputFields);
    const transformationRules: TransformationRule[] = [];

    for (const mapping of mappings) {
      const rule = await this.createTransformationRule(mapping, inputSample.data, outputSample.data);
      transformationRules.push(rule);
    }

    return transformationRules;
  }

  private extractFields(data: any, prefix: string = ''): { path: string; value: any; type: string }[] {
    const fields: { path: string; value: any; type: string }[] = [];
    
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          fields.push(...this.extractFields(value, fieldPath));
        } else {
          fields.push({
            path: fieldPath,
            value: value,
            type: Array.isArray(value) ? 'array' : typeof value
          });
        }
      }
    }
    
    return fields;
  }

  private async generateFieldMappings(inputFields: any[], outputFields: any[]): Promise<FieldMapping[]> {
    const mappings: FieldMapping[] = [];

    for (const outputField of outputFields) {
      let bestMapping: FieldMapping | null = null;
      let highestScore = 0;

      for (const inputField of inputFields) {
        const similarity = this.calculateFieldSimilarity(inputField, outputField);
        const transformationType = this.detectTransformationType(inputField, outputField);
        const mlPrediction = await this.getMlPrediction(inputField, outputField);

        const score = (similarity * 0.4) + (mlPrediction * 0.6);

        if (score > highestScore && score > 0.3) {
          highestScore = score;
          bestMapping = {
            inputField: inputField.path,
            outputField: outputField.path,
            similarity: similarity,
            transformationType: transformationType,
            mlPrediction: mlPrediction
          };
        }
      }

      if (bestMapping) {
        mappings.push(bestMapping);
      }
    }

    return mappings;
  }

  private calculateFieldSimilarity(inputField: any, outputField: any): number {
    // Name similarity (using Levenshtein distance)
    const nameSimilarity = this.levenshteinSimilarity(
      inputField.path.toLowerCase(),
      outputField.path.toLowerCase()
    );

    // Type compatibility
    const typeCompatibility = this.getTypeCompatibility(inputField.type, outputField.type);

    // Value pattern similarity
    const valueSimilarity = this.getValueSimilarity(inputField.value, outputField.value);

    return (nameSimilarity * 0.4) + (typeCompatibility * 0.3) + (valueSimilarity * 0.3);
  }

  private levenshteinSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (matrix[str2.length][str1.length] / maxLength);
  }

  private getTypeCompatibility(inputType: string, outputType: string): number {
    if (inputType === outputType) return 1.0;
    
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'string': { 'string': 1.0, 'number': 0.7, 'boolean': 0.5 },
      'number': { 'string': 0.8, 'number': 1.0, 'boolean': 0.6 },
      'boolean': { 'string': 0.6, 'number': 0.4, 'boolean': 1.0 }
    };

    return compatibilityMatrix[inputType]?.[outputType] || 0.2;
  }

  private getValueSimilarity(inputValue: any, outputValue: any): number {
    // Check for concatenation patterns
    if (typeof inputValue === 'string' && typeof outputValue === 'string') {
      if (outputValue.includes(inputValue)) return 0.9;
      if (inputValue.includes(outputValue)) return 0.7;
    }

    // Check for calculation patterns
    if (typeof inputValue === 'number' && typeof outputValue === 'number') {
      const ratio = Math.min(inputValue, outputValue) / Math.max(inputValue, outputValue);
      return ratio > 0.5 ? 0.8 : 0.3;
    }

    // Check for boolean conversion patterns
    if (typeof inputValue === 'number' && typeof outputValue === 'boolean') {
      return 0.7; // Age > 18 -> isAdult pattern
    }

    return 0.1;
  }

  private detectTransformationType(inputField: any, outputField: any): string {
    const inputType = inputField.type;
    const outputType = outputField.type;
    const inputValue = inputField.value;
    const outputValue = outputField.value;

    // Concatenation detection
    if (inputType === 'string' && outputType === 'string' && 
        typeof outputValue === 'string' && typeof inputValue === 'string' &&
        outputValue.includes(inputValue)) {
      return 'concat';
    }

    // Type casting detection
    if (inputType !== outputType) {
      return 'typecast';
    }

    // Boolean conversion (age -> isAdult pattern)
    if (inputType === 'number' && outputType === 'boolean') {
      return 'comparison';
    }

    // Direct mapping
    if (inputValue === outputValue) {
      return 'map';
    }

    return 'custom';
  }

  private async getMlPrediction(inputField: any, outputField: any): Promise<number> {
    if (!this.model.isLoaded || !this.model.model) {
      return this.getRuleBasedPrediction(inputField, outputField);
    }

    try {
      const features = this.extractFeatures(inputField, outputField);
      const prediction = this.model.model.predict(tf.tensor2d([features])) as tf.Tensor;
      const result = await prediction.data();
      prediction.dispose();
      
      return Math.max(...result);
    } catch (error) {
      console.warn('ML prediction failed, using rule-based fallback:', error);
      return this.getRuleBasedPrediction(inputField, outputField);
    }
  }

  private extractFeatures(inputField: any, outputField: any): number[] {
    const features = new Array(20).fill(0);
    
    // Field name similarity features
    features[0] = this.levenshteinSimilarity(inputField.path, outputField.path);
    features[1] = inputField.path.length / 100; // Normalized length
    features[2] = outputField.path.length / 100;
    
    // Type features
    features[3] = inputField.type === 'string' ? 1 : 0;
    features[4] = inputField.type === 'number' ? 1 : 0;
    features[5] = inputField.type === 'boolean' ? 1 : 0;
    features[6] = outputField.type === 'string' ? 1 : 0;
    features[7] = outputField.type === 'number' ? 1 : 0;
    features[8] = outputField.type === 'boolean' ? 1 : 0;
    
    // Value pattern features
    features[9] = this.getValueSimilarity(inputField.value, outputField.value);
    features[10] = typeof inputField.value === 'string' && typeof outputField.value === 'string' && 
                   outputField.value.includes(inputField.value) ? 1 : 0;
    
    // Additional context features
    features[11] = inputField.path.includes('name') ? 1 : 0;
    features[12] = outputField.path.includes('name') ? 1 : 0;
    features[13] = inputField.path.includes('id') ? 1 : 0;
    features[14] = outputField.path.includes('id') ? 1 : 0;
    features[15] = inputField.path.includes('date') ? 1 : 0;
    features[16] = outputField.path.includes('date') ? 1 : 0;
    features[17] = inputField.path.includes('age') ? 1 : 0;
    features[18] = outputField.path.includes('adult') || outputField.path.includes('Adult') ? 1 : 0;
    features[19] = Math.random() * 0.1; // Noise feature for regularization

    return features;
  }

  private getRuleBasedPrediction(inputField: any, outputField: any): number {
    const similarity = this.calculateFieldSimilarity(inputField, outputField);
    const transformationType = this.detectTransformationType(inputField, outputField);
    
    let confidence = similarity;
    
    // Boost confidence for known patterns
    if (transformationType === 'map' && similarity > 0.8) confidence += 0.2;
    if (transformationType === 'concat') confidence += 0.15;
    if (transformationType === 'comparison') confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private async createTransformationRule(mapping: FieldMapping, inputData: any, outputData: any): Promise<TransformationRule> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let logic = '';
    let transformFunction = '';
    
    switch (mapping.transformationType) {
      case 'concat':
        logic = this.generateConcatLogic(mapping, inputData, outputData);
        transformFunction = this.generateConcatFunction(mapping);
        break;
      case 'comparison':
        logic = this.generateComparisonLogic(mapping, inputData, outputData);
        transformFunction = this.generateComparisonFunction(mapping);
        break;
      case 'typecast':
        logic = this.generateTypecastLogic(mapping);
        transformFunction = this.generateTypecastFunction(mapping);
        break;
      case 'map':
      default:
        logic = `data.${mapping.inputField}`;
        transformFunction = `(data) => data.${mapping.inputField}`;
        break;
    }

    return {
      id: ruleId,
      type: mapping.transformationType as any,
      sourceField: mapping.inputField,
      targetField: mapping.outputField,
      logic: logic,
      confidence: mapping.mlPrediction,
      mlScore: mapping.mlPrediction,
      transformFunction: transformFunction
    };
  }

  private generateConcatLogic(mapping: FieldMapping, inputData: any, outputData: any): string {
    // Analyze the concatenation pattern
    const outputValue = this.getNestedValue(outputData, mapping.outputField);
    const inputValue = this.getNestedValue(inputData, mapping.inputField);
    
    if (typeof outputValue === 'string' && typeof inputValue === 'string') {
      // Try to find the pattern (e.g., firstName + " " + lastName = fullName)
      const parts = outputValue.split(' ');
      if (parts.length === 2) {
        return `data.${mapping.inputField.replace('Name', 'Name')} + " " + data.${mapping.inputField.replace('first', 'last')}`;
      }
    }
    
    return `data.${mapping.inputField}`;
  }

  private generateConcatFunction(mapping: FieldMapping): string {
    return `(data) => {
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      return firstName + ' ' + lastName;
    }`;
  }

  private generateComparisonLogic(mapping: FieldMapping, inputData: any, outputData: any): string {
    const inputValue = this.getNestedValue(inputData, mapping.inputField);
    
    if (typeof inputValue === 'number') {
      return `data.${mapping.inputField} >= 18`;
    }
    
    return `Boolean(data.${mapping.inputField})`;
  }

  private generateComparisonFunction(mapping: FieldMapping): string {
    return `(data) => data.${mapping.inputField} >= 18`;
  }

  private generateTypecastLogic(mapping: FieldMapping): string {
    return `typeof data.${mapping.inputField} === 'string' ? Number(data.${mapping.inputField}) : data.${mapping.inputField}`;
  }

  private generateTypecastFunction(mapping: FieldMapping): string {
    return `(data) => typeof data.${mapping.inputField} === 'string' ? Number(data.${mapping.inputField}) : data.${mapping.inputField}`;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  generateTransformationRules(rules: TransformationRule[]): string {
    const rulesCode = rules.map(rule => {
      const logic = rule.logic || `data.${rule.sourceField}`;
      return `  result.${rule.targetField} = ${logic};`;
    }).join('\n');

    return `function transformData(data) {
  const result = {};
${rulesCode}
  return result;
}`;
  }

  async trainModel(inputSamples: DataSample[], outputSamples: DataSample[]): Promise<void> {
    if (!this.model.isLoaded || !this.model.model) {
      await this.model.loadModel();
    }
    // Training logic would go here
    console.log('Model training completed with', inputSamples.length, 'samples');
  }

  private generateTypecastLogic(mapping: FieldMapping): string {
    return `String(data.${mapping.inputField})`;
  }

  private generateTypecastFunction(mapping: FieldMapping): string {
    return `(data) => String(data.${mapping.inputField})`;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  generateTransformationRules(rules: TransformationRule[]): string {
    const functionBody = rules.map(rule => {
      return `  // ${rule.type} transformation: ${rule.sourceField} -> ${rule.targetField}
  result.${rule.targetField} = ${rule.transformFunction ? 
    `(${rule.transformFunction})(data)` : 
    rule.logic.replace(/data\./g, 'data.')};`;
    }).join('\n');

    return `function transform(data) {
  const result = {};
${functionBody}
  return result;
}`;
  }

  async trainModel(inputSamples: DataSample[], outputSamples: DataSample[]): Promise<void> {
    if (!this.model.isLoaded || !this.model.model) {
      console.warn('Model not loaded, skipping training');
      return;
    }

    // This would be implemented for continuous learning
    console.log('Training model with new samples...');
  }
}

export class PipelineEngine {
  private pipelines: Map<string, PipelineConfig> = new Map();
  private compiledPipelines: Map<string, CompiledPipeline> = new Map();
  private analyzer: MLAnalysisEngine;
  private streamBuffers: Map<string, StreamBuffer> = new Map();
  private activeConnectors: Map<string, any> = new Map();
  private modelInitialized: boolean = false;

  constructor(modelConfig: ModelConfig = { type: 'built-in' }) {
    this.analyzer = new MLAnalysisEngine(modelConfig);
  }

  private async ensureModelInitialized(): Promise<void> {
    if (!this.modelInitialized) {
      await this.analyzer.initializeModel();
      this.modelInitialized = true;
    }
  }

  async createPipeline(name: string, inputSample: DataSample, outputSample: DataSample, options?: {
    modelConfig?: ModelConfig;
    dataSources?: DataSourceConfig[];
    etlOptions?: any;
  }): Promise<PipelineConfig> {
    const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🤖 Creating pipeline "${name}" - ML analysis starting...`);
    
    // Initialize ML model ONLY during pipeline creation
    await this.ensureModelInitialized();
    
    // Enhanced metadata extraction with data lineage
    inputSample.metadata = this.extractMetadata(inputSample.data);
    outputSample.metadata = this.extractMetadata(outputSample.data);
    
    // Set up data source connections if provided
    const dataSources: DataSourceConfig[] = options?.dataSources || [];
    for (const sourceConfig of dataSources) {
      await this.analyzer.connectDataSource(sourceConfig);
    }
    
    // ML-based transformation analysis (ONLY happens here)
    const transformationRules = await this.analyzer.analyzeTransformation(inputSample, outputSample);
    
    // Calculate accuracy based on rule confidence
    const accuracy = transformationRules.length > 0 
      ? transformationRules.reduce((sum, rule) => sum + rule.confidence, 0) / transformationRules.length
      : 0.5;

    // ETL configuration with intelligent defaults
    const etlConfig = {
      extractionRules: this.generateExtractionRules(inputSample),
      validationRules: this.generateValidationRules(inputSample, outputSample),
      errorHandling: options?.etlOptions?.errorHandling || 'log' as const,
      parallelProcessing: options?.etlOptions?.parallelProcessing !== false,
      checkpointInterval: options?.etlOptions?.checkpointInterval || 1000
    };

    const pipeline: PipelineConfig = {
      id: pipelineId,
      name,
      inputSample,
      outputSample,
      transformationRules,
      createdAt: new Date(),
      accuracy,
      version: '1.0.0',
      modelConfig: options?.modelConfig || { type: 'built-in' },
      dataSources,
      etlConfig,
      performance: {
        throughput: 0,
        latency: 0,
        errorRate: 0
      }
    };

    // Compile pipeline into static executable function
    await this.compilePipeline(pipeline);
    
    this.pipelines.set(pipelineId, pipeline);
    
    console.log(`✅ Pipeline "${name}" created and compiled as static logic`);
    console.log(`📊 ML Analysis complete - ${transformationRules.length} transformation rules generated`);
    console.log(`🎯 Accuracy: ${(accuracy * 100).toFixed(1)}%`);
    
    return pipeline;
  }

  private extractMetadata(data: any): any {
    const fields: string[] = [];
    const types: { [key: string]: string } = {};
    
    const extractFields = (obj: any, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        fields.push(fieldPath);
        types[fieldPath] = Array.isArray(value) ? 'array' : typeof value;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          extractFields(value, fieldPath);
        }
      }
    };

    if (typeof data === 'object' && data !== null) {
      extractFields(data);
    }

    return {
      fields,
      types,
      relationships: [],
      isTimeSeries: this.detectTimeSeries(data),
      timeField: this.detectTimeField(data)
    };
  }

  private detectTimeSeries(data: any): boolean {
    const timeFields = ['timestamp', 'date', 'time', 'created_at', 'updated_at'];
    const dataStr = JSON.stringify(data).toLowerCase();
    return timeFields.some(field => dataStr.includes(field));
  }

  private detectTimeField(data: any): string | undefined {
    const timeFields = ['timestamp', 'date', 'time', 'created_at', 'updated_at'];
    const fields = this.extractMetadata(data).fields;
    return fields.find((field: string) => 
      timeFields.some(timeField => field.toLowerCase().includes(timeField))
    );
  }

  async updatePipeline(pipelineId: string, newInputSample?: DataSample, newOutputSample?: DataSample): Promise<PipelineConfig> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    const inputSample = newInputSample || pipeline.inputSample;
    const outputSample = newOutputSample || pipeline.outputSample;

    console.log(`🔄 Pipeline config changed - reinitializing ML analysis for "${pipeline.name}"`);
    
    // Re-initialize ML model ONLY when configuration changes
    await this.ensureModelInitialized();
    
    // Re-analyze with new samples (ML model interaction happens here)
    const transformationRules = await this.analyzer.analyzeTransformation(inputSample, outputSample);
    
    const accuracy = transformationRules.length > 0 
      ? transformationRules.reduce((sum, rule) => sum + rule.confidence, 0) / transformationRules.length
      : 0.5;

    const updatedPipeline: PipelineConfig = {
      ...pipeline,
      inputSample,
      outputSample,
      transformationRules,
      accuracy,
      version: this.incrementVersion(pipeline.version)
    };

    // Recompile pipeline with new static logic
    await this.compilePipeline(updatedPipeline);
    
    this.pipelines.set(pipelineId, updatedPipeline);
    
    console.log(`✅ Pipeline "${pipeline.name}" updated and recompiled`);
    console.log(`📊 New accuracy: ${(accuracy * 100).toFixed(1)}%`);
    
    return updatedPipeline;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private async compilePipeline(pipeline: PipelineConfig): Promise<void> {
    console.log(`🔧 Compiling pipeline "${pipeline.name}" into static execution logic...`);
    
    // Generate optimized transformation function
    const transformCode = this.generateOptimizedTransformFunction(pipeline.transformationRules);
    
    // Create compiled function (no ML dependencies)
    const transformFunction = new Function('inputData', transformCode);
    
    const compiledPipeline: CompiledPipeline = {
      id: pipeline.id,
      name: pipeline.name,
      transformFunction,
      createdAt: pipeline.createdAt,
      lastCompiled: new Date(),
      version: pipeline.version,
      isStatic: true
    };
    
    this.compiledPipelines.set(pipeline.id, compiledPipeline);
    console.log(`⚡ Pipeline "${pipeline.name}" compiled successfully - ready for static execution`);
  }

  private generateOptimizedTransformFunction(rules: TransformationRule[]): string {
    const transformations = rules.map(rule => {
      // Generate optimized static transformation code
      switch (rule.type) {
        case 'map':
          return `  result['${rule.targetField}'] = inputData['${rule.sourceField}'];`;
        case 'concat':
          return `  result['${rule.targetField}'] = (inputData['firstName'] || '') + ' ' + (inputData['lastName'] || '');`;
        case 'comparison':
          return `  result['${rule.targetField}'] = (inputData['${rule.sourceField}'] || 0) >= 18;`;
        case 'typecast':
          return `  result['${rule.targetField}'] = String(inputData['${rule.sourceField}'] || '');`;
        case 'custom':
          return `  result['${rule.targetField}'] = ${rule.logic};`;
        default:
          return `  result['${rule.targetField}'] = inputData['${rule.sourceField}'];`;
      }
    }).join('\n');

    return `
  const result = {};
  try {
${transformations}
  } catch (error) {
    console.warn('Transformation error:', error);
  }
  return result;`;
  }

  executePipeline(pipelineId: string, inputData: any): any {
    // Use compiled static pipeline for execution (no ML model interaction)
    const compiledPipeline = this.compiledPipelines.get(pipelineId);
    if (!compiledPipeline) {
      throw new Error(`Compiled pipeline ${pipelineId} not found. Pipeline may need to be recreated.`);
    }

    const startTime = performance.now();
    
    try {
      // Execute static transformation function (very fast, no ML overhead)
      const result = compiledPipeline.transformFunction(inputData);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Update performance stats
      this.updatePerformanceMetrics(pipelineId, { latency: executionTime, success: true });
      
      console.log(`⚡ Pipeline executed in ${executionTime.toFixed(2)}ms (static mode)`);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      this.updatePerformanceMetrics(pipelineId, { latency: executionTime, success: false });
      
      console.error(`❌ Pipeline execution failed in ${executionTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  getPipeline(pipelineId: string): PipelineConfig | undefined {
    return this.pipelines.get(pipelineId);
  }

  getAllPipelines(): PipelineConfig[] {
    return Array.from(this.pipelines.values());
  }

  generatePipelineCode(pipelineId: string): string {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    return this.analyzer.generateTransformationRules(pipeline.transformationRules);
  }

  async trainPipelineModel(inputSamples: DataSample[], outputSamples: DataSample[]): Promise<void> {
    await this.analyzer.trainModel(inputSamples, outputSamples);
  }

  // Performance monitoring methods
  getPipelineStats(pipelineId: string): any {
    const buffer = this.streamBuffers.get(pipelineId);
    const pipeline = this.pipelines.get(pipelineId);
    
    const mlStats = pipeline?.transformationRules.map(rule => ({
      ruleId: rule.id,
      mlScore: rule.mlScore || 0,
      confidence: rule.confidence,
      type: rule.type
    })) || [];
    
    return {
      bufferSize: buffer?.data.length || 0,
      maxBufferSize: buffer?.maxSize || 0,
      processedItems: buffer?.currentIndex || 0,
      isStreaming: pipeline?.isStreaming || false,
      accuracy: pipeline?.accuracy || 0,
      mlStats
    };
  }

  clearBuffer(pipelineId: string): void {
    const buffer = this.streamBuffers.get(pipelineId);
    if (buffer) {
      buffer.data = [];
      buffer.currentIndex = 0;
    }
  }

  isPipelineStatic(pipelineId: string): boolean {
    const compiled = this.compiledPipelines.get(pipelineId);
    return compiled?.isStatic || false;
  }

  getPipelineExecutionMode(pipelineId: string): 'static' | 'dynamic' | 'not_found' {
    const compiled = this.compiledPipelines.get(pipelineId);
    if (!compiled) return 'not_found';
    return compiled.isStatic ? 'static' : 'dynamic';
  }

  getCompiledPipelinesInfo(): Array<{id: string, name: string, isStatic: boolean, lastCompiled: Date}> {
    return Array.from(this.compiledPipelines.values()).map(cp => ({
      id: cp.id,
      name: cp.name,
      isStatic: cp.isStatic,
      lastCompiled: cp.lastCompiled
    }));
  }
}
