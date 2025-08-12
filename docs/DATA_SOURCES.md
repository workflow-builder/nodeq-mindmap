
# Data Source Integration Guide

Complete guide for integrating real-time and batch data sources.

## Real-World Integration Examples

### 1. IoT Hub Integration

```mermaid
flowchart TD
    subgraph "IoT Ecosystem"
        A[Temperature Sensors]
        B[Humidity Sensors]
        C[Motion Detectors]
        D[Smart Cameras]
    end

    E[IoT Hub<br/>Azure/AWS] 

    subgraph "NodeQ Pipeline"
        F[Data Ingestion]
        G[ML Pattern Analysis]
        H[Real-time Processing]
    end

    subgraph "Output Systems"
        I[Real-time Dashboard]
        J[Data Warehouse]
        K[Alert System]
        L[Mobile Notifications]
    end

    A --> E
    B --> E
    C --> E
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
```

```javascript
const iotConfig = {
  type: 'iot-hub',
  connection: {
    host: 'your-iot-hub.azure-devices.net',
    credentials: {
      token: process.env.IOT_HUB_TOKEN
    }
  },
  polling: {
    interval: 1000,
    batchSize: 100
  }
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
    readings: {
      temp_celsius: 23.5,
      humidity_percent: 45.2
    },
    alert_level: 'normal',
    processed_at: '2024-01-15T10:30:01Z'
  },
  {
    dataSources: [iotConfig],
    etlOptions: {
      errorHandling: 'log',
      parallelProcessing: true
    }
  }
);

// Start real-time processing
await mindMap.startRealtimeProcessing();
```

### 2. Kafka Stream Processing

```mermaid
flowchart LR
    subgraph "Data Producers"
        A[Web Applications]
        B[Mobile Apps]
        C[Microservices]
        D[Legacy Systems]
    end

    subgraph "Kafka Cluster"
        E[User Events Topic]
        F[System Events Topic]
        G[Error Events Topic]
    end

    subgraph "NodeQ Pipeline"
        H[Stream Consumer]
        I[ML Analysis Engine]
        J[Real-time Transformation]
    end

    subgraph "Output Destinations"
        K[Analytics Database]
        L[Real-time Metrics]
        M[Alert Dashboard]
        N[ML Training Data]
    end

    A --> E
    B --> E
    C --> F
    D --> F
    E --> H
    F --> H
    G --> H
    H --> I
    I --> J
    J --> K
    J --> L
    J --> M
    J --> N
```

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
  polling: {
    interval: 500,
    batchSize: 1000
  }
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
  {
    dataSources: [kafkaConfig],
    modelConfig: { type: 'tensorflow' }
  }
);
```

### 3. REST API Integration

```mermaid
flowchart TB
    subgraph "External APIs"
        A[Payment Gateway API]
        B[Social Media API]
        C[Weather API]
        D[Stock Market API]
    end

    subgraph "NodeQ API Connector"
        E[Polling Scheduler]
        F[Rate Limiter]
        G[Error Recovery]
        H[Data Normalizer]
    end

    subgraph "Processing Pipeline"
        I[Schema Validation]
        J[ML Enrichment]
        K[Data Transformation]
    end

    subgraph "Storage & Output"
        L[Redis Cache]
        M[Primary Database]
        N[Analytics Engine]
        O[Real-time Dashboard]
    end

    A --> E
    B --> E
    C --> E
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    K --> M
    K --> N
    K --> O
```

```javascript
const apiConfig = {
  type: 'rest-api',
  connection: {
    apiEndpoint: 'https://api.example.com/data',
    credentials: {
      token: 'Bearer ' + process.env.API_TOKEN
    }
  },
  polling: {
    interval: 30000, // Poll every 30 seconds
    batchSize: 50
  }
};

const pipeline = await mindMap.createDataPipeline(
  'External API Integration',
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    customer_id: 1,
    full_name: 'John Doe',
    contact_email: 'john@example.com',
    status: 'active',
    last_sync: '2024-01-15T10:30:01Z'
  },
  { dataSources: [apiConfig] }
);
```

### 4. Database Change Streams

```mermaid
flowchart TD
    subgraph "Source Databases"
        A[(PostgreSQL<br/>Change Log)]
        B[(MongoDB<br/>Change Streams)]
        C[(MySQL<br/>Binary Log)]
    end

    subgraph "Change Detection"
        D[CDC Connector]
        E[Event Parser]
        F[Change Classifier]
    end

    subgraph "NodeQ Pipeline"
        G[Stream Processor]
        H[ML Pattern Detector]
        I[Event Transformer]
    end

    subgraph "Downstream Systems"
        J[Elasticsearch<br/>Search Index]
        K[Data Warehouse<br/>Analytics]
        L[Notification<br/>Service]
        M[Audit Log<br/>System]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    I --> L
    I --> M
```

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

const pipeline = await mindMap.createDataPipeline(
  'Database CDC Pipeline',
  {
    operation: 'INSERT',
    table: 'users',
    data: {
      id: 123,
      email: 'new@example.com',
      created_at: '2024-01-15T10:30:00Z'
    }
  },
  {
    change_type: 'user_created',
    user_id: 123,
    email: 'new@example.com',
    should_send_welcome: true,
    index_for_search: true,
    created_timestamp: '2024-01-15T10:30:00Z'
  },
  { dataSources: [dbConfig] }
);
```

### 5. WebSocket Real-time Data

```mermaid
flowchart LR
    subgraph "Real-time Sources"
        A[Trading Platforms]
        B[Chat Applications]
        C[Gaming Servers]
        D[IoT Gateways]
    end

    subgraph "WebSocket Layer"
        E[WebSocket Server]
        F[Connection Manager]
        G[Message Router]
    end

    subgraph "NodeQ Pipeline"
        H[Stream Processor]
        I[ML Real-time Analyzer]
        J[Event Aggregator]
    end

    subgraph "Live Outputs"
        K[Live Trading Dashboard]
        L[Real-time Notifications]
        M[Performance Metrics]
        N[Alert Management]
    end

    A -.->|WebSocket| E
    B -.->|WebSocket| E
    C -.->|WebSocket| E
    D -.->|WebSocket| E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    J --> L
    J --> M
    J --> N
```

```javascript
const wsConfig = {
  type: 'websocket',
  connection: {
    host: 'wss://api.example.com/stream',
    credentials: {
      token: process.env.WS_TOKEN
    }
  }
};

const pipeline = await mindMap.createDataPipeline(
  'Live Trading Data',
  {
    symbol: 'BTC/USD',
    price: 45000.50,
    volume: 1.25,
    timestamp: '2024-01-15T10:30:00.123Z'
  },
  {
    trading_pair: 'BTC/USD',
    current_price: 45000.50,
    volume_24h: 1.25,
    price_change_percent: 2.5,
    trend: 'bullish',
    last_updated: '2024-01-15T10:30:00.123Z'
  },
  {
    dataSources: [wsConfig],
    etlOptions: {
      checkpointInterval: 100 // High frequency processing
    }
  }
);
```

## Configuration Reference

### ML Model Configurations

#### Built-in TensorFlow Model (Default)
```javascript
const mindMap = new NodeQMindMap({
  container: '#mindmap-container',
  data: {}
});

// Uses built-in TensorFlow.js model
const pipeline = await mindMap.createDataPipeline(
  'Default Pipeline',
  inputSample,
  outputSample
);
```

#### Custom TensorFlow Model
```javascript
const customModelConfig = {
  type: 'tensorflow',
  localPath: './models/custom-pipeline-model/model.json',
  parameters: {
    threshold: 0.8
  }
};

const pipeline = await mindMap.createDataPipeline(
  'Custom TF Pipeline',
  inputSample,
  outputSample,
  { modelConfig: customModelConfig }
);
```

#### Hugging Face Model Integration
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

#### OpenAI GPT Integration
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

#### Custom API Model
```javascript
const customApiConfig = {
  type: 'custom',
  endpoint: 'https://your-ml-api.com/analyze',
  apiKey: process.env.CUSTOM_API_KEY,
  parameters: {
    analysisType: 'pipeline-generation',
    confidence: 0.9
  }
};

const pipeline = await mindMap.createDataPipeline(
  'Custom API Pipeline',
  inputSample,
  outputSample,
  { modelConfig: customApiConfig }
);
```

## Performance Optimization

### High-Throughput Configuration
```javascript
const highThroughputConfig = {
  dataSources: [kafkaConfig],
  etlOptions: {
    parallelProcessing: true,
    batchSize: 1000,
    checkpointInterval: 5000,
    errorHandling: 'continue',
    maxRetries: 3
  }
};
```

### Low-Latency Configuration
```javascript
const lowLatencyConfig = {
  dataSources: [wsConfig],
  etlOptions: {
    parallelProcessing: false,
    batchSize: 1,
    checkpointInterval: 1,
    errorHandling: 'fail-fast'
  }
};
```
