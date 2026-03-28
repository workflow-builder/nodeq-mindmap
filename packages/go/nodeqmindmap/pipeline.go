package nodeqmindmap

import (
	"fmt"
	"strings"
	"sync"
	"time"
)

// PipelineEngine manages in-memory ETL pipelines.
// Mirrors the TypeScript PipelineEngine class.
type PipelineEngine struct {
	mu       sync.RWMutex
	pipelines map[string]*PipelineConfig
	nextID   int
}

// NewPipelineEngine creates a new empty pipeline engine.
func NewPipelineEngine() *PipelineEngine {
	return &PipelineEngine{
		pipelines: make(map[string]*PipelineConfig),
		nextID:   1,
	}
}

// CreatePipeline creates and registers a new pipeline definition.
func (e *PipelineEngine) CreatePipeline(
	name string,
	inputSample DataSample,
	outputSample DataSample,
	options map[string]any,
) (*PipelineConfig, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	id := fmt.Sprintf("pipeline_%d", e.nextID)
	e.nextID++

	modelConfig := map[string]any{"type": "auto"}
	if options != nil {
		if mc, ok := options["modelConfig"].(map[string]any); ok {
			modelConfig = mc
		}
	}

	var dataSources []map[string]any
	if options != nil {
		if ds, ok := options["dataSources"].([]map[string]any); ok {
			dataSources = ds
		}
	}

	var etlConfig map[string]any
	if options != nil {
		if ec, ok := options["etlOptions"].(map[string]any); ok {
			etlConfig = ec
		}
	}

	p := &PipelineConfig{
		ID:                  id,
		Name:                name,
		InputSample:         inputSample,
		OutputSample:        outputSample,
		TransformationRules: []TransformationRule{},
		ModelConfig:         modelConfig,
		Accuracy:            0.85,
		Version:             "1.0.0",
		CreatedAt:           time.Now(),
		DataSources:         dataSources,
		ETLConfig:           etlConfig,
		Performance: PipelinePerformance{
			Throughput: 100,
			Latency:    50,
			ErrorRate:  0.01,
		},
	}

	e.pipelines[id] = p
	return p, nil
}

// UpdatePipeline replaces the input/output samples on an existing pipeline.
func (e *PipelineEngine) UpdatePipeline(
	pipelineID string,
	inputSample *DataSample,
	outputSample *DataSample,
) (*PipelineConfig, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	p, ok := e.pipelines[pipelineID]
	if !ok {
		return nil, fmt.Errorf("pipeline %s not found", pipelineID)
	}
	if inputSample != nil {
		p.InputSample = *inputSample
	}
	if outputSample != nil {
		p.OutputSample = *outputSample
	}
	return p, nil
}

// ExecutePipeline runs the pipeline against inputData and returns an ExecutionResult.
func (e *PipelineEngine) ExecutePipeline(pipelineID string, inputData any) (*ExecutionResult, error) {
	e.mu.RLock()
	_, ok := e.pipelines[pipelineID]
	e.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("pipeline %s not found", pipelineID)
	}

	return &ExecutionResult{
		Processed:  true,
		Data:       inputData,
		Timestamp:  time.Now(),
		PipelineID: pipelineID,
	}, nil
}

// GetPipeline returns the pipeline with the given ID, or nil.
func (e *PipelineEngine) GetPipeline(pipelineID string) *PipelineConfig {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.pipelines[pipelineID]
}

// GetAllPipelines returns all registered pipelines.
func (e *PipelineEngine) GetAllPipelines() []*PipelineConfig {
	e.mu.RLock()
	defer e.mu.RUnlock()
	out := make([]*PipelineConfig, 0, len(e.pipelines))
	for _, p := range e.pipelines {
		out = append(out, p)
	}
	return out
}

// GetPipelineStats returns performance stats for the pipeline.
func (e *PipelineEngine) GetPipelineStats(pipelineID string) (*PipelineStats, error) {
	e.mu.RLock()
	p, ok := e.pipelines[pipelineID]
	e.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("pipeline %s not found", pipelineID)
	}
	return &PipelineStats{
		ID:           p.ID,
		Name:         p.Name,
		Performance:  p.Performance,
		Version:      p.Version,
		LastExecuted: time.Now(),
	}, nil
}

// GeneratePipelineCode returns a Go function stub for the pipeline.
func (e *PipelineEngine) GeneratePipelineCode(pipelineID string) (string, error) {
	e.mu.RLock()
	p, ok := e.pipelines[pipelineID]
	e.mu.RUnlock()

	if !ok {
		return "", fmt.Errorf("pipeline %s not found", pipelineID)
	}

	fnName := strings.ReplaceAll(p.Name, " ", "_")
	return fmt.Sprintf(
		"// Generated pipeline code for %s\nfunc %s(input any) any {\n\t// TODO: add transformation logic\n\treturn input\n}",
		p.Name, fnName,
	), nil
}

// GetPipelineExecutionMode returns the execution mode string (always "static").
func (e *PipelineEngine) GetPipelineExecutionMode(_ string) string {
	return "static"
}

// IsPipelineStatic returns whether the pipeline runs in static mode (always true).
func (e *PipelineEngine) IsPipelineStatic(_ string) bool {
	return true
}
