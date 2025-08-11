
# Data Pipeline Guide

## ⚡ Pipeline Builder Overview

NodeQ MindMap includes an intelligent data pipeline builder that uses ML to automatically generate transformation logic from input/output samples.

## 🚀 Quick Start

### Creating Your First Pipeline

```javascript
import { NodeQMindMap } from 'nodeq-mindmap';

const mindMap = new NodeQMindMap({
  container: '#mindmap-container',
  data: {},
  width: 1000,
  height: 600
});

const inputSample = {
  "firstName": "John",
  "lastName": "Doe",
  "age": 25,
  "email": "john.doe@email.com"
};

const outputSample = {
  "fullName": "John Doe",
  "isAdult": true,
  "contact": "john.doe@email.com"
};

async function createPipeline() {
  const pipeline = await mindMap.createDataPipeline(
    'User Data Transformation', 
    inputSample, 
    outputSample
  );
  
  console.log(`Pipeline created with ${pipeline.transformationRules.length} rules`);
  console.log(`Accuracy: ${(pipeline.accuracy * 100).toFixed(1)}%`);
}

createPipeline();
```

### Executing Pipelines

```javascript
// Execute with new data (uses compiled static logic - FAST)
const testData = {
  "firstName": "Jane",
  "lastName": "Smith", 
  "age": 17,
  "email": "jane.smith@email.com"
};

const result = mindMap.executePipeline(testData);
console.log(result);
// Output: {
//   "fullName": "Jane Smith",
//   "isAdult": false,
//   "contact": "jane.smith@email.com"
// }
```

## 🧠 ML Model Configuration

### Built-in TensorFlow (Default)

```javascript
const pipeline = await mindMap.createDataPipeline(
  'Default Pipeline',
  inputSample,
  outputSample
);
```

### Custom TensorFlow Model

```javascript
const customModelConfig = {
  type: 'tensorflow',
  localPath: './models/custom-pipeline-model/model.json',
  parameters: { threshold: 0.8 }
};

const pipeline = await mindMap.createDataPipeline(
  'Custom TF Pipeline',
  inputSample,
  outputSample,
  { modelConfig: customModelConfig }
);
```

### Hugging Face Integration

```javascript
const hfModelConfig = {
  type: 'huggingface',
  modelName: 'sentence-transformers/all-MiniLM-L6-v2',
  endpoint: 'https://api-inference.huggingface.co/models/',
  apiKey: process.env.HF_API_TOKEN
};

const pipeline = await mindMap.createDataPipeline(
  'HF Semantic Pipeline',
  inputSample,
  outputSample,
  { modelConfig: hfModelConfig }
);
```

### OpenAI GPT Integration

```javascript
const openaiConfig = {
  type: 'openai',
  modelName: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  parameters: {
    temperature: 0.2,
    maxTokens: 1000
  }
};

const pipeline = await mindMap.createDataPipeline(
  'GPT-Powered Pipeline',
  inputSample,
  outputSample,
  { modelConfig: openaiConfig }
);
```

## 🔌 Data Source Integrations

### IoT Hub Integration

```javascript
const iotConfig = {
  type: 'iot-hub',
  connection: {
    host: 'your-iot-hub.azure-devices.net',
    credentials: { token: process.env.IOT_HUB_TOKEN }
  },
  polling: { interval: 1000, batchSize: 100 }
};

const pipeline = await mindMap.createDataPipeline(
  'IoT Sensor Pipeline',
  {
    deviceId: 'sensor_001',
    temperature: 23.5,
    humidity: 45.2,
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    device: 'sensor_001',
    readings: { temp_celsius: 23.5, humidity_percent: 45.2 },
    alert_level: 'normal',
    processed_at: '2024-01-15T10:30:01Z'
  },
  { dataSources: [iotConfig] }
);
```

### Kafka Stream Processing

```javascript
const kafkaConfig = {
  type: 'kafka',
  connection: {
    host: 'localhost:9092',
    topic: 'user-events',
    credentials: {
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD
    }
  },
  polling: { interval: 500, batchSize: 1000 }
};

const pipeline = await mindMap.createDataPipeline(
  'User Event Stream',
  {
    userId: '12345',
    event: 'page_view',
    url: '/dashboard',
    timestamp: '2024-01-15T10:30:00Z',
    metadata: { browser: 'chrome', device: 'mobile' }
  },
  {
    user_id: '12345',
    action: 'page_view',
    page: '/dashboard',
    session_data: {
      browser: 'chrome',
      device_type: 'mobile',
      engagement_score: 0.75
    },
    processed_timestamp: '2024-01-15T10:30:01Z'
  },
  { dataSources: [kafkaConfig] }
);
```

### REST API Integration

```javascript
const apiConfig = {
  type: 'rest-api',
  connection: {
    apiEndpoint: 'https://api.example.com/data',
    credentials: { token: 'Bearer ' + process.env.API_TOKEN }
  },
  polling: { interval: 30000, batchSize: 50 }
};
```

### Database Change Streams

```javascript
const dbConfig = {
  type: 'database',
  connection: {
    connectionString: process.env.DATABASE_URL,
    credentials: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
  }
};
```

## 🔄 ETL Process Replacement

### Traditional ETL vs NodeQ Smart Pipelines

**Traditional ETL**: Weeks to Months | High Maintenance | Low Flexibility
1. Write extraction code for each data source
2. Manually define transformation rules  
3. Configure loading procedures
4. Test and debug extensively
5. Maintain and update regularly

**NodeQ Smart Pipeline**: Minutes to Hours | Low Maintenance | High Flexibility
1. Upload input/output samples
2. AI analyzes and generates pipeline
3. Review and approve transformations
4. Deploy with one click
5. Monitor performance automatically

### Pipeline Code Generation

```javascript
// Export pipeline as executable code
const generatedCode = mindMap.exportPipelineCode();
console.log(generatedCode);

// Example output:
// function transformData(inputData) {
//   const result = {};
//   result.fullName = inputData.firstName + ' ' + inputData.lastName;
//   result.isAdult = Number(inputData.age) >= 18;
//   result.contact = inputData.email;
//   return result;
// }
```

## 📊 Performance Monitoring

```javascript
// Get pipeline statistics
const stats = mindMap.getPipelineStats();

// Monitor real-time performance
mindMap.onPipelineMetrics((metrics) => {
  console.log('Throughput:', metrics.throughput);
  console.log('Latency:', metrics.latency);
  console.log('Error Rate:', metrics.errorRate);
});
```
