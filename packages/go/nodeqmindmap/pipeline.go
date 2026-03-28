package nodeqmindmap

import (
	"fmt"
	"math"
	"strings"
	"sync"
	"time"
)

// ── Schema analysis helpers ──────────────────────────────────────────────────

// flattenObject flattens a nested map[string]any into dot-notation paths.
func flattenObject(obj any, prefix string) map[string]any {
	out := make(map[string]any)
	m, ok := obj.(map[string]any)
	if !ok {
		return out
	}
	for k, v := range m {
		key := k
		if prefix != "" {
			key = prefix + "." + k
		}
		if nested, ok := v.(map[string]any); ok {
			for nk, nv := range flattenObject(nested, key) {
				out[nk] = nv
			}
		} else {
			out[key] = v
		}
	}
	return out
}

func normalise(s string) string {
	s = strings.ReplaceAll(s, "_", "")
	s = strings.ReplaceAll(s, "-", "")
	s = strings.ReplaceAll(s, " ", "")
	return strings.ToLower(s)
}

func toCamelCase(s string) string {
	parts := strings.FieldsFunc(s, func(r rune) bool { return r == '_' || r == '-' })
	if len(parts) == 0 {
		return s
	}
	result := parts[0]
	for _, p := range parts[1:] {
		if len(p) > 0 {
			result += strings.ToUpper(p[:1]) + p[1:]
		}
	}
	return result
}

func fieldNameSimilarity(a, b string) float64 {
	na, nb := normalise(a), normalise(b)
	if na == nb {
		return 1.0
	}
	if strings.ToLower(toCamelCase(a)) == strings.ToLower(b) {
		return 0.95
	}
	if strings.ToLower(toCamelCase(b)) == strings.ToLower(a) {
		return 0.95
	}
	if strings.Contains(na, nb) || strings.Contains(nb, na) {
		return 0.7
	}
	// Common prefix
	common := 0
	rna := []rune(na)
	rnb := []rune(nb)
	minLen := len(rna)
	if len(rnb) < minLen {
		minLen = len(rnb)
	}
	for i := 0; i < minLen; i++ {
		if rna[i] == rnb[i] {
			common++
		} else {
			break
		}
	}
	maxLen := len(rna)
	if len(rnb) > maxLen {
		maxLen = len(rnb)
	}
	if maxLen == 0 {
		return 0
	}
	prefixScore := float64(common) / float64(maxLen)
	if prefixScore > 0.5 {
		return prefixScore * 0.8
	}
	return 0
}

func toFloat64(v any) (float64, bool) {
	switch x := v.(type) {
	case float64:
		return x, true
	case float32:
		return float64(x), true
	case int:
		return float64(x), true
	case int64:
		return float64(x), true
	}
	return 0, false
}

type scalingResult struct {
	ruleType string
	factor   float64
}

func detectScaling(inVal, outVal any) *scalingResult {
	in, ok1 := toFloat64(inVal)
	out, ok2 := toFloat64(outVal)
	if !ok1 || !ok2 || in == 0 || out == 0 {
		return nil
	}
	ratio := in / out
	if math.Abs(ratio-100) < 0.01 {
		return &scalingResult{"divide", 100}
	}
	if math.Abs(ratio-1000) < 0.01 {
		return &scalingResult{"divide", 1000}
	}
	if math.Abs(ratio-0.01) < 0.0001 {
		return &scalingResult{"multiply", 100}
	}
	return nil
}

func generateRules(inputSample, outputSample DataSample) ([]TransformationRule, float64) {
	inFlat := flattenObject(inputSample.Data, "")
	outFlat := flattenObject(outputSample.Data, "")

	var rules []TransformationRule
	matchedOut := make(map[string]bool)

	for outKey, outVal := range outFlat {
		var bestIn string
		var bestScore float64
		for inKey := range inFlat {
			score := fieldNameSimilarity(inKey, outKey)
			if score > bestScore {
				bestScore = score
				bestIn = inKey
			}
		}

		if bestIn != "" && bestScore >= 0.7 {
			inVal := inFlat[bestIn]
			scaling := detectScaling(inVal, outVal)

			var ruleType string
			var factor *float64

			if scaling != nil {
				ruleType = scaling.ruleType
				f := scaling.factor
				factor = &f
			} else if bestScore < 1.0 && bestScore >= 0.9 {
				ruleType = "rename"
			} else {
				_, inIsNum := toFloat64(inVal)
				_, outIsNum := toFloat64(outVal)
				if inIsNum != outIsNum {
					ruleType = "convert"
				} else {
					ruleType = "direct"
				}
			}

			rules = append(rules, TransformationRule{
				SourceField: bestIn,
				TargetField: outKey,
				Type:        ruleType,
				Confidence:  bestScore,
				Factor:      factor,
			})
			matchedOut[outKey] = true
		}
	}

	// Unmatched outputs → constant
	for outKey := range outFlat {
		if !matchedOut[outKey] {
			rules = append(rules, TransformationRule{
				SourceField: "",
				TargetField: outKey,
				Type:        "constant",
				Confidence:  0.4,
			})
		}
	}

	if len(rules) == 0 {
		return rules, 0
	}
	var sum float64
	for _, r := range rules {
		sum += r.Confidence
	}
	accuracy := sum / float64(len(rules))
	if accuracy > 0.99 {
		accuracy = 0.99
	}
	return rules, accuracy
}

func applyRules(inputData any, rules []TransformationRule) map[string]any {
	inFlat := flattenObject(inputData, "")
	out := make(map[string]any)

	for _, rule := range rules {
		if rule.Type == "constant" {
			setNested(out, rule.TargetField, nil)
			continue
		}
		val, exists := inFlat[rule.SourceField]
		if !exists {
			continue
		}
		if rule.Type == "divide" && rule.Factor != nil {
			if fv, ok := toFloat64(val); ok {
				val = fv / *rule.Factor
			}
		} else if rule.Type == "multiply" && rule.Factor != nil {
			if fv, ok := toFloat64(val); ok {
				val = fv * *rule.Factor
			}
		} else if rule.Type == "convert" {
			val = fmt.Sprintf("%v", val)
		}
		setNested(out, rule.TargetField, val)
	}
	return out
}

func setNested(obj map[string]any, key string, value any) {
	parts := strings.SplitN(key, ".", 2)
	if len(parts) == 1 {
		obj[key] = value
		return
	}
	child, ok := obj[parts[0]].(map[string]any)
	if !ok {
		child = make(map[string]any)
		obj[parts[0]] = child
	}
	setNested(child, parts[1], value)
}

// ── PipelineEngine ────────────────────────────────────────────────────────────

// PipelineEngine manages in-memory ETL pipelines.
// Mirrors the TypeScript PipelineEngine class.
type PipelineEngine struct {
	mu        sync.RWMutex
	pipelines map[string]*PipelineConfig
	nextID    int
}

// NewPipelineEngine creates a new empty pipeline engine.
func NewPipelineEngine() *PipelineEngine {
	return &PipelineEngine{
		pipelines: make(map[string]*PipelineConfig),
		nextID:    1,
	}
}

// CreatePipeline creates and registers a new pipeline with auto-generated rules.
func (e *PipelineEngine) CreatePipeline(
	name string,
	inputSample DataSample,
	outputSample DataSample,
	options map[string]any,
) (*PipelineConfig, error) {
	rules, accuracy := generateRules(inputSample, outputSample)

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
		TransformationRules: rules,
		ModelConfig:         modelConfig,
		Accuracy:            accuracy,
		Version:             "1.0.0",
		CreatedAt:           time.Now(),
		DataSources:         dataSources,
		ETLConfig:           etlConfig,
		Performance: PipelinePerformance{
			Throughput: 1000,
			Latency:    5,
			ErrorRate:  1 - accuracy,
		},
	}

	e.pipelines[id] = p
	return p, nil
}

// UpdatePipeline replaces the input/output samples and regenerates rules.
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
	if inputSample != nil || outputSample != nil {
		rules, accuracy := generateRules(p.InputSample, p.OutputSample)
		p.TransformationRules = rules
		p.Accuracy = accuracy
		p.Performance.ErrorRate = 1 - accuracy
	}
	return p, nil
}

// ExecutePipeline runs the pipeline rules against inputData.
func (e *PipelineEngine) ExecutePipeline(pipelineID string, inputData any) (*ExecutionResult, error) {
	e.mu.RLock()
	p, ok := e.pipelines[pipelineID]
	e.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("pipeline %s not found", pipelineID)
	}

	transformed := applyRules(inputData, p.TransformationRules)
	return &ExecutionResult{
		Processed:  true,
		Data:       transformed,
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

// GeneratePipelineCode returns a Go function for the pipeline transformation.
func (e *PipelineEngine) GeneratePipelineCode(pipelineID string) (string, error) {
	e.mu.RLock()
	p, ok := e.pipelines[pipelineID]
	e.mu.RUnlock()

	if !ok {
		return "", fmt.Errorf("pipeline %s not found", pipelineID)
	}

	fnName := strings.ReplaceAll(p.Name, " ", "_")
	var sb strings.Builder
	fmt.Fprintf(&sb, "// Auto-generated pipeline: %s\n", p.Name)
	fmt.Fprintf(&sb, "// Accuracy: %.1f%% | Rules: %d\n", p.Accuracy*100, len(p.TransformationRules))
	fmt.Fprintf(&sb, "func %s(input map[string]any) map[string]any {\n", fnName)
	sb.WriteString("\tout := make(map[string]any)\n")
	for _, r := range p.TransformationRules {
		switch r.Type {
		case "constant":
			fmt.Fprintf(&sb, "\tout[\"%s\"] = nil // computed — fill in manually\n", r.TargetField)
		case "divide":
			if r.Factor != nil {
				fmt.Fprintf(&sb, "\tout[\"%s\"] = toFloat64(input[\"%s\"]) / %g\n", r.TargetField, r.SourceField, *r.Factor)
			}
		case "multiply":
			if r.Factor != nil {
				fmt.Fprintf(&sb, "\tout[\"%s\"] = toFloat64(input[\"%s\"]) * %g\n", r.TargetField, r.SourceField, *r.Factor)
			}
		case "convert":
			fmt.Fprintf(&sb, "\tout[\"%s\"] = fmt.Sprintf(\"%%v\", input[\"%s\"])\n", r.TargetField, r.SourceField)
		default:
			fmt.Fprintf(&sb, "\tout[\"%s\"] = input[\"%s\"] // %s (%.0f%%)\n",
				r.TargetField, r.SourceField, r.Type, r.Confidence*100)
		}
	}
	sb.WriteString("\treturn out\n}")
	return sb.String(), nil
}

// StartRealtimeProcessing calls onData at the given interval until the returned stop function is called.
func (e *PipelineEngine) StartRealtimeProcessing(
	pipelineID string,
	onData func(*ExecutionResult),
	intervalMs int,
) (func(), error) {
	e.mu.RLock()
	_, ok := e.pipelines[pipelineID]
	e.mu.RUnlock()
	if !ok {
		return nil, fmt.Errorf("pipeline %s not found", pipelineID)
	}

	stop := make(chan struct{})
	go func() {
		ticker := time.NewTicker(time.Duration(intervalMs) * time.Millisecond)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				e.mu.RLock()
				p := e.pipelines[pipelineID]
				e.mu.RUnlock()
				if p == nil {
					return
				}
				result, err := e.ExecutePipeline(pipelineID, p.InputSample.Data)
				if err == nil {
					onData(result)
				}
			case <-stop:
				return
			}
		}
	}()

	return func() { close(stop) }, nil
}

// GetPipelineExecutionMode returns the execution mode string (always "static").
func (e *PipelineEngine) GetPipelineExecutionMode(_ string) string {
	return "static"
}

// IsPipelineStatic returns whether the pipeline runs in static mode (always true).
func (e *PipelineEngine) IsPipelineStatic(_ string) bool {
	return true
}
