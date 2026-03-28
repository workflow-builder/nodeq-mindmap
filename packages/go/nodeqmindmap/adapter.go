package nodeqmindmap

import (
	"fmt"
	"reflect"
)

// knownKeys are the structural keys consumed at the root level and not treated as children.
var knownKeys = map[string]bool{
	"topic": true, "title": true, "name": true,
	"summary": true, "description": true,
	"skills": true, "children": true,
}

// JsonSchemaAdapter converts arbitrary map/slice data into a MindMapNode tree.
type JsonSchemaAdapter struct{}

// ConvertToStandard converts any Go value (map, struct-as-map, slice, etc.) to a MindMapNode.
// Mirrors the TypeScript JsonSchemaAdapter.convertToStandard behaviour.
func (JsonSchemaAdapter) ConvertToStandard(data any) MindMapNode {
	if data == nil {
		return MindMapNode{Topic: "Invalid Data", Summary: "Unable to process data"}
	}

	m, ok := toStringMap(data)
	if !ok {
		return MindMapNode{Topic: fmt.Sprintf("%v", data)}
	}

	root := MindMapNode{
		Topic:    stringField(m, "topic", "title", "name"),
		Summary:  stringField(m, "summary", "description"),
		Skills:   stringSliceField(m, "skills"),
		Children: []MindMapNode{},
	}
	if root.Topic == "" {
		root.Topic = "Root"
	}

	// Append explicit children first
	if rawChildren, ok := m["children"]; ok {
		for _, c := range toSlice(rawChildren) {
			root.Children = append(root.Children, JsonSchemaAdapter{}.ConvertToStandard(c))
		}
	}

	// Append remaining keys as child nodes
	for key, val := range m {
		if knownKeys[key] {
			continue
		}
		if val == nil {
			continue
		}
		rv := reflect.ValueOf(val)
		switch rv.Kind() {
		case reflect.Map:
			root.Children = append(root.Children, MindMapNode{
				Topic:    key,
				Children: []MindMapNode{JsonSchemaAdapter{}.ConvertToStandard(val)},
			})
		case reflect.Slice:
			sl := toSlice(val)
			child := MindMapNode{
				Topic:    key,
				Summary:  fmt.Sprintf("%d item(s)", len(sl)),
				Children: []MindMapNode{},
			}
			for i, item := range sl {
				if i >= 20 {
					break
				}
				im, ok := toStringMap(item)
				if ok {
					_ = im
					child.Children = append(child.Children, MindMapNode{
						Topic:    fmt.Sprintf("%s[%d]", key, i),
						Children: []MindMapNode{JsonSchemaAdapter{}.ConvertToStandard(item)},
					})
				} else {
					child.Children = append(child.Children, MindMapNode{Topic: fmt.Sprintf("%v", item)})
				}
			}
			root.Children = append(root.Children, child)
		default:
			root.Children = append(root.Children, MindMapNode{Topic: fmt.Sprintf("%s: %v", key, val)})
		}
	}

	return root
}

// ExtractSchema returns a flat map of field→type-string from an arbitrary value.
func ExtractSchema(data any) map[string]any {
	schema := map[string]any{}
	if data == nil {
		return schema
	}
	rv := reflect.ValueOf(data)
	if rv.Kind() == reflect.Slice && rv.Len() > 0 {
		return ExtractSchema(rv.Index(0).Interface())
	}
	m, ok := toStringMap(data)
	if !ok {
		return schema
	}
	for k, v := range m {
		schema[k] = fmt.Sprintf("%T", v)
	}
	return schema
}

// --- helpers ---

func toStringMap(v any) (map[string]any, bool) {
	if v == nil {
		return nil, false
	}
	m, ok := v.(map[string]any)
	return m, ok
}

func toSlice(v any) []any {
	if v == nil {
		return nil
	}
	rv := reflect.ValueOf(v)
	if rv.Kind() != reflect.Slice {
		return []any{v}
	}
	out := make([]any, rv.Len())
	for i := range out {
		out[i] = rv.Index(i).Interface()
	}
	return out
}

func stringField(m map[string]any, keys ...string) string {
	for _, k := range keys {
		if v, ok := m[k]; ok {
			if s, ok := v.(string); ok && s != "" {
				return s
			}
		}
	}
	return ""
}

func stringSliceField(m map[string]any, key string) []string {
	v, ok := m[key]
	if !ok {
		return nil
	}
	sl := toSlice(v)
	out := make([]string, 0, len(sl))
	for _, item := range sl {
		if s, ok := item.(string); ok {
			out = append(out, s)
		}
	}
	return out
}
