// Package nodeqmindmap provides data types and pipeline engine for NODEQ mind maps.
// This is a server-side port of the nodeq-mindmap npm package (D3 visualization not included).
package nodeqmindmap

import "time"

// MindMapNode represents a single node in a mind map tree.
type MindMapNode struct {
	Topic    string        `json:"topic"`
	Summary  string        `json:"summary,omitempty"`
	Skills   []string      `json:"skills,omitempty"`
	Children []MindMapNode `json:"children,omitempty"`
}

// DataSample describes an input or output schema and a sample value.
type DataSample struct {
	Format   string         `json:"format"`
	Schema   map[string]any `json:"schema"`
	Data     any            `json:"data"`
	Metadata map[string]any `json:"metadata,omitempty"`
}

// TransformationRule describes a single field mapping between input and output.
type TransformationRule struct {
	SourceField string  `json:"sourceField"`
	TargetField string  `json:"targetField"`
	Type        string  `json:"type"`
	Confidence  float64 `json:"confidence"`
}

// PipelinePerformance holds runtime metrics for a pipeline.
type PipelinePerformance struct {
	Throughput float64 `json:"throughput"` // records/sec
	Latency    float64 `json:"latency"`    // ms
	ErrorRate  float64 `json:"errorRate"`  // 0–1
}

// PipelineConfig is the complete definition of a pipeline.
type PipelineConfig struct {
	ID                  string               `json:"id"`
	Name                string               `json:"name"`
	InputSample         DataSample           `json:"inputSample"`
	OutputSample        DataSample           `json:"outputSample"`
	TransformationRules []TransformationRule `json:"transformationRules"`
	ModelConfig         map[string]any       `json:"modelConfig"`
	Accuracy            float64              `json:"accuracy"`
	Version             string               `json:"version"`
	CreatedAt           time.Time            `json:"createdAt"`
	DataSources         []map[string]any     `json:"dataSources,omitempty"`
	ETLConfig           map[string]any       `json:"etlConfig,omitempty"`
	Performance         PipelinePerformance  `json:"performance"`
}

// ExecutionResult is returned by PipelineEngine.ExecutePipeline.
type ExecutionResult struct {
	Processed  bool      `json:"processed"`
	Data       any       `json:"data"`
	Timestamp  time.Time `json:"timestamp"`
	PipelineID string    `json:"pipelineId"`
}

// PipelineStats is returned by PipelineEngine.GetPipelineStats.
type PipelineStats struct {
	ID          string              `json:"id"`
	Name        string              `json:"name"`
	Performance PipelinePerformance `json:"performance"`
	Version     string              `json:"version"`
	LastExecuted time.Time          `json:"lastExecuted"`
}
