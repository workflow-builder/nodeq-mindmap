
# CLI Guide

## 🖥️ Command Line Interface

NodeQ MindMap includes a powerful CLI for headless operations, server-side rendering, and automated pipeline management.

## 📦 Installation

```bash
npm install -g nodeq-mindmap
```

## 🎯 Basic Usage

### Generate Mind Map

```bash
# Create mind map from JSON file
nodeq-mindmap generate \
  --input data.json \
  --output mindmap.svg \
  --width 1200 \
  --height 800

# Create with custom theme
nodeq-mindmap generate \
  --input data.json \
  --output mindmap.svg \
  --theme dark \
  --width 1200 \
  --height 800
```

### Pipeline Management

```bash
# Create pipeline from samples
nodeq-mindmap pipeline create \
  --input sample-input.json \
  --output sample-output.json \
  --name "User Data Pipeline"

# Execute pipeline
nodeq-mindmap pipeline execute \
  --name "User Data Pipeline" \
  --input new-data.json \
  --output transformed-data.json

# List all pipelines
nodeq-mindmap pipeline list

# Get pipeline statistics
nodeq-mindmap pipeline stats --name "User Data Pipeline"
```

## 🧠 Model Configuration

### TensorFlow Model

```bash
nodeq-mindmap pipeline create \
  --input sample-input.json \
  --output sample-output.json \
  --name "TF Pipeline" \
  --model-type tensorflow \
  --model-path ./models/custom-model.json
```

### OpenAI Integration

```bash
nodeq-mindmap pipeline create \
  --input sample-input.json \
  --output sample-output.json \
  --name "GPT Pipeline" \
  --model-type openai \
  --model-name gpt-4 \
  --api-key $OPENAI_API_KEY
```

### Hugging Face Model

```bash
nodeq-mindmap pipeline create \
  --input sample-input.json \
  --output sample-output.json \
  --name "HF Pipeline" \
  --model-type huggingface \
  --model-name sentence-transformers/all-MiniLM-L6-v2
```

## 🔌 Data Source Integration

### Kafka Source

```bash
nodeq-mindmap pipeline create \
  --input kafka-sample.json \
  --output processed-sample.json \
  --name "Kafka Pipeline" \
  --data-source kafka \
  --kafka-host localhost:9092 \
  --kafka-topic user-events
```

### IoT Hub

```bash
nodeq-mindmap pipeline create \
  --input iot-sample.json \
  --output analytics-sample.json \
  --name "IoT Pipeline" \
  --data-source iot-hub \
  --iot-endpoint your-hub.azure-devices.net \
  --iot-token $IOT_HUB_TOKEN
```

### REST API

```bash
nodeq-mindmap pipeline create \
  --input api-sample.json \
  --output enriched-sample.json \
  --name "API Pipeline" \
  --data-source rest-api \
  --api-endpoint https://api.example.com/data \
  --api-token $API_TOKEN \
  --polling-interval 30000
```

## ⚙️ ETL Configuration

```bash
# Create pipeline with ETL options
nodeq-mindmap pipeline create \
  --input raw-data.json \
  --output clean-data.json \
  --name "ETL Pipeline" \
  --etl-error-handling log \
  --etl-parallel-processing true \
  --etl-checkpoint-interval 1000 \
  --etl-batch-size 500

# Start real-time processing
nodeq-mindmap pipeline start-realtime \
  --name "ETL Pipeline" \
  --monitoring true

# Export pipeline code
nodeq-mindmap pipeline export-code \
  --name "ETL Pipeline" \
  --output pipeline-function.js
```

## 📊 Monitoring & Reporting

```bash
# Get detailed statistics
nodeq-mindmap pipeline stats \
  --name "Production Pipeline" \
  --format table

# Export metrics
nodeq-mindmap pipeline export-metrics \
  --name "Production Pipeline" \
  --output metrics.json \
  --time-range 24h

# Generate performance report
nodeq-mindmap pipeline report \
  --name "Production Pipeline" \
  --format pdf \
  --output pipeline-report.pdf
```

## 🎨 Visualization Options

```bash
# Generate with custom styling
nodeq-mindmap generate \
  --input data.json \
  --output mindmap.svg \
  --node-color "#4299e1" \
  --text-color "#2d3748" \
  --background-color "#ffffff" \
  --font-size 14 \
  --width 1200 \
  --height 800

# Batch processing
nodeq-mindmap batch \
  --input-dir ./data \
  --output-dir ./outputs \
  --format svg \
  --theme ocean
```

## 🔧 Configuration File

Create a `nodeq.config.json` file:

```json
{
  "defaultTheme": "dark",
  "outputFormat": "svg",
  "defaultSize": {
    "width": 1200,
    "height": 800
  },
  "pipelineDefaults": {
    "modelType": "tensorflow",
    "errorHandling": "log",
    "parallelProcessing": true
  }
}
```

Use with:

```bash
nodeq-mindmap --config nodeq.config.json generate --input data.json
```
