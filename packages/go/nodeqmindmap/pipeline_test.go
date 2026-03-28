package nodeqmindmap_test

import (
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/nodeq/nodeq-mindmap/nodeqmindmap"
)

func makeSamples() (nodeqmindmap.DataSample, nodeqmindmap.DataSample) {
	inp := nodeqmindmap.DataSample{
		Format: "json",
		Schema: map[string]any{"price_cents": "number", "item_name": "string", "qty": "number"},
		Data:   map[string]any{"price_cents": float64(1000), "item_name": "Widget", "qty": float64(3)},
	}
	out := nodeqmindmap.DataSample{
		Format: "json",
		Schema: map[string]any{"price_cents": "number", "item_name": "string", "total": "number"},
		Data:   map[string]any{"price_cents": float64(1000), "item_name": "Widget", "total": float64(3000)},
	}
	return inp, out
}

func TestCreatePipeline(t *testing.T) {
	eng := nodeqmindmap.NewPipelineEngine()
	inp, out := makeSamples()
	pl, err := eng.CreatePipeline("OrderPipeline", inp, out, nil)
	if err != nil {
		t.Fatalf("CreatePipeline error: %v", err)
	}
	if pl.ID == "" {
		t.Error("expected non-empty ID")
	}
	if pl.Name != "OrderPipeline" {
		t.Errorf("name = %q", pl.Name)
	}
	if len(pl.TransformationRules) == 0 {
		t.Error("expected rules to be generated")
	}
	if pl.Accuracy <= 0 || pl.Accuracy > 1 {
		t.Errorf("accuracy out of range: %f", pl.Accuracy)
	}

	// At least one direct/rename rule for matching field names
	var hasDirectOrRename bool
	for _, r := range pl.TransformationRules {
		if r.Type == "direct" || r.Type == "rename" {
			hasDirectOrRename = true
			break
		}
	}
	if !hasDirectOrRename {
		t.Error("expected at least one direct or rename rule")
	}
}

func TestExecutePipeline(t *testing.T) {
	eng := nodeqmindmap.NewPipelineEngine()
	inp, out := makeSamples()
	pl, _ := eng.CreatePipeline("Test", inp, out, nil)

	result, err := eng.ExecutePipeline(pl.ID, map[string]any{
		"price_cents": float64(500), "item_name": "Gadget", "qty": float64(2),
	})
	if err != nil {
		t.Fatalf("ExecutePipeline: %v", err)
	}
	if !result.Processed {
		t.Error("expected Processed=true")
	}
	data, ok := result.Data.(map[string]any)
	if !ok {
		t.Fatalf("expected Data to be map, got %T", result.Data)
	}
	if data["price_cents"] != float64(500) {
		t.Errorf("price_cents = %v", data["price_cents"])
	}
	if data["item_name"] != "Gadget" {
		t.Errorf("item_name = %v", data["item_name"])
	}
}

func TestGeneratePipelineCode(t *testing.T) {
	eng := nodeqmindmap.NewPipelineEngine()
	inp, out := makeSamples()
	pl, _ := eng.CreatePipeline("MyPipeline", inp, out, nil)
	code, err := eng.GeneratePipelineCode(pl.ID)
	if err != nil {
		t.Fatalf("GeneratePipelineCode: %v", err)
	}
	if !strings.Contains(code, "func MyPipeline") {
		t.Errorf("code missing function: %s", code)
	}
	if !strings.Contains(code, `out["`) {
		t.Errorf("code missing assignments: %s", code)
	}
}

func TestGetPipelineStats(t *testing.T) {
	eng := nodeqmindmap.NewPipelineEngine()
	inp, out := makeSamples()
	pl, _ := eng.CreatePipeline("StatTest", inp, out, nil)
	stats, err := eng.GetPipelineStats(pl.ID)
	if err != nil {
		t.Fatalf("GetPipelineStats: %v", err)
	}
	if stats.Name != "StatTest" {
		t.Errorf("name = %q", stats.Name)
	}
}

func TestStartRealtimeProcessing(t *testing.T) {
	eng := nodeqmindmap.NewPipelineEngine()
	inp, out := makeSamples()
	pl, _ := eng.CreatePipeline("RT", inp, out, nil)

	var count atomic.Int32
	stop, err := eng.StartRealtimeProcessing(pl.ID, func(r *nodeqmindmap.ExecutionResult) {
		count.Add(1)
	}, 80)
	if err != nil {
		t.Fatalf("StartRealtimeProcessing: %v", err)
	}
	time.Sleep(300 * time.Millisecond)
	stop()
	time.Sleep(20 * time.Millisecond)
	if count.Load() < 2 {
		t.Errorf("expected >=2 messages, got %d", count.Load())
	}
}

func TestGetAllPipelines(t *testing.T) {
	eng := nodeqmindmap.NewPipelineEngine()
	inp, out := makeSamples()
	pl, _ := eng.CreatePipeline("P1", inp, out, nil)
	all := eng.GetAllPipelines()
	found := false
	for _, p := range all {
		if p.ID == pl.ID {
			found = true
		}
	}
	if !found {
		t.Error("pipeline not found in GetAllPipelines")
	}
}

func TestUpdatePipeline(t *testing.T) {
	eng := nodeqmindmap.NewPipelineEngine()
	inp, out := makeSamples()
	pl, _ := eng.CreatePipeline("UpdTest", inp, out, nil)
	newInp := nodeqmindmap.DataSample{
		Format: "json",
		Schema: map[string]any{"user_id": "string"},
		Data:   map[string]any{"user_id": "u1"},
	}
	updated, err := eng.UpdatePipeline(pl.ID, &newInp, nil)
	if err != nil {
		t.Fatalf("UpdatePipeline: %v", err)
	}
	if updated.InputSample.Data.(map[string]any)["user_id"] != "u1" {
		t.Error("input sample not updated")
	}
}

func TestJsonSchemaAdapter(t *testing.T) {
	data := map[string]any{
		"topic":  "AI",
		"skills": []any{"Python", "Go"},
		"sub":    map[string]any{"name": "ML"},
	}
	node := nodeqmindmap.JsonSchemaAdapter{}.ConvertToStandard(data)
	if node.Topic != "AI" {
		t.Errorf("topic = %q", node.Topic)
	}
	if len(node.Skills) != 2 {
		t.Errorf("skills count = %d", len(node.Skills))
	}
	foundSub := false
	for _, c := range node.Children {
		if c.Topic == "sub" {
			foundSub = true
		}
	}
	if !foundSub {
		t.Error("sub not found as child")
	}
}
