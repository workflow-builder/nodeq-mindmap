package nodeqmindmap

import "fmt"

// PipelineToMindMap converts a PipelineConfig to a MindMapNode tree for visualization.
// Mirrors the private pipelineToMindMap method on NodeQMindMap.
func PipelineToMindMap(e *PipelineEngine, pipeline *PipelineConfig) MindMapNode {
	mode := e.GetPipelineExecutionMode(pipeline.ID)
	isStatic := e.IsPipelineStatic(pipeline.ID)

	modeLabel := "Dynamic execution"
	if isStatic {
		modeLabel = "Static compiled execution"
	}

	children := []MindMapNode{
		{
			Topic:   "Execution Mode",
			Summary: modeLabel,
			Skills:  []string{fmt.Sprintf("Mode: %s", mode)},
		},
	}

	if len(pipeline.DataSources) > 0 {
		srcChildren := make([]MindMapNode, 0, len(pipeline.DataSources))
		for _, src := range pipeline.DataSources {
			t, _ := src["type"].(string)
			var label string
			if conn, ok := src["connection"].(map[string]any); ok {
				if h, ok := conn["host"].(string); ok {
					label = h
				} else if ep, ok := conn["apiEndpoint"].(string); ok {
					label = ep
				}
			}
			if label == "" {
				label = "Local"
			}
			srcChildren = append(srcChildren, MindMapNode{
				Topic:   t,
				Summary: label,
			})
		}
		children = append(children, MindMapNode{
			Topic:    "Data Sources",
			Summary:  fmt.Sprintf("%d connected sources", len(pipeline.DataSources)),
			Children: srcChildren,
		})
	}

	inputKeys := make([]string, 0, len(pipeline.InputSample.Schema))
	for k := range pipeline.InputSample.Schema {
		inputKeys = append(inputKeys, k)
	}
	children = append(children, MindMapNode{
		Topic:   "Input Schema",
		Summary: "Data input configuration",
		Skills:  inputKeys,
	})

	ruleChildren := make([]MindMapNode, 0, len(pipeline.TransformationRules))
	for _, r := range pipeline.TransformationRules {
		ruleChildren = append(ruleChildren, MindMapNode{
			Topic:   fmt.Sprintf("%s → %s", r.SourceField, r.TargetField),
			Summary: fmt.Sprintf("%s (%d%%)", r.Type, int(r.Confidence*100)),
		})
	}
	children = append(children, MindMapNode{
		Topic:    "Transformations",
		Summary:  fmt.Sprintf("%d rules", len(pipeline.TransformationRules)),
		Children: ruleChildren,
	})

	outputKeys := make([]string, 0, len(pipeline.OutputSample.Schema))
	for k := range pipeline.OutputSample.Schema {
		outputKeys = append(outputKeys, k)
	}
	children = append(children, MindMapNode{
		Topic:   "Output Schema",
		Summary: "Data output configuration",
		Skills:  outputKeys,
	})

	return MindMapNode{
		Topic:    pipeline.Name,
		Summary:  fmt.Sprintf("ETL Pipeline - Accuracy: %.1f%%", pipeline.Accuracy*100),
		Skills:   []string{fmt.Sprintf("Version: %s", pipeline.Version)},
		Children: children,
	}
}
