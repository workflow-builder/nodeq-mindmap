
# ML Models & AI Integration Guide

## 🧠 Supported ML Models

NodeQ MindMap supports multiple AI/ML backends for intelligent data pipeline generation.

## 🚀 Built-in Models

### TensorFlow.js (Default)
The default model uses TensorFlow.js for client-side ML processing.

```javascript
// Automatic - no configuration needed
const pipeline = await mindMap.createDataPipeline(
  'Auto Pipeline',
  inputSample,
  outputSample
);
```

**Advantages:**
- ✅ No API keys required
- ✅ Offline processing
- ✅ Fast inference
- ✅ Privacy-focused (data stays local)

## ☁️ Cloud AI Services

### OpenAI GPT Models
Leverage GPT-3.5 or GPT-4 for advanced transformation logic.

```javascript
const openaiConfig = {
  type: 'openai',
  modelName: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  parameters: {
    temperature: 0.2,
    maxTokens: 1000,
    systemPrompt: 'You are a data transformation expert.'
  }
};

const pipeline = await mindMap.createDataPipeline(
  'GPT-Powered Pipeline',
  inputSample,
  outputSample,
  { modelConfig: openaiConfig }
);
```

### Hugging Face Models
Access thousands of pre-trained models via Hugging Face API.

```javascript
const hfConfig = {
  type: 'huggingface',
  modelName: 'sentence-transformers/all-MiniLM-L6-v2',
  endpoint: 'https://api-inference.huggingface.co/models/',
  apiKey: process.env.HF_API_TOKEN,
  parameters: {
    options: {
      wait_for_model: true
    }
  }
};
```

## 🔧 Custom Model Integration

### Custom API Endpoints
Integrate your own ML services.

```javascript
const customConfig = {
  type: 'custom',
  endpoint: 'https://your-ml-api.com/transform',
  apiKey: process.env.CUSTOM_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  },
  parameters: {
    analysisType: 'pipeline-generation',
    confidence: 0.9
  }
};
```

### Local Model Files
Use your own trained TensorFlow models.

```javascript
const localModelConfig = {
  type: 'tensorflow',
  localPath: './models/custom-pipeline-model/model.json',
  parameters: {
    threshold: 0.8,
    batchSize: 32
  }
};
```

## 🎯 Model Selection Guidelines

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| **Simple Transformations** | Built-in TensorFlow | Fast, offline, no API costs |
| **Complex Logic** | OpenAI GPT-4 | Advanced reasoning capabilities |
| **Semantic Analysis** | Hugging Face Transformers | Specialized NLP models |
| **Custom Requirements** | Custom API | Full control over processing |
| **Privacy-Critical** | Local TensorFlow | Data never leaves your system |

## 📊 Performance Comparison

```javascript
// Benchmark different models
const benchmarkResults = await mindMap.benchmarkModels([
  'tensorflow',
  'openai-gpt-3.5',
  'huggingface-bert'
], testData);

console.log(benchmarkResults);
// {
//   tensorflow: { latency: '45ms', accuracy: '92%', cost: '$0' },
//   openai: { latency: '1200ms', accuracy: '98%', cost: '$0.002' },
//   huggingface: { latency: '800ms', accuracy: '94%', cost: '$0.0001' }
// }
```

## 🔐 Security & Privacy

### API Key Management
```javascript
// Environment variables (recommended)
const config = {
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY
};

// Or pass directly (not recommended for production)
const config = {
  type: 'openai',
  apiKey: 'sk-...'
};
```

### Data Privacy Options
```javascript
const privacyConfig = {
  dataRetention: false,        // Don't store data on API provider
  anonymization: true,         // Remove PII before sending
  localProcessingOnly: true    // Force local processing
};
```

## 🔄 Model Switching

```javascript
// Switch models at runtime
mindMap.switchModel('openai', openaiConfig);
mindMap.switchModel('tensorflow'); // Back to default

// Use different models for different pipelines
await mindMap.createDataPipeline('Fast Pipeline', input, output, {
  modelConfig: { type: 'tensorflow' }
});

await mindMap.createDataPipeline('Smart Pipeline', input, output, {
  modelConfig: { type: 'openai' }
});
```
