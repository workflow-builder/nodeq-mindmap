"""PipelineEngine — mirrors pipeline-engine.ts."""

from __future__ import annotations

import threading
from datetime import datetime
from typing import Any, Callable

from .types import (
    DataSample,
    ExecutionResult,
    PipelineConfig,
    PipelinePerformance,
    PipelineStats,
    TransformationRule,
)

# ── Schema analysis helpers ──────────────────────────────────────────────────

def _flatten_object(obj: Any, prefix: str = "") -> dict[str, Any]:
    """Flatten a nested dict into dot-notation paths."""
    out: dict[str, Any] = {}
    if not isinstance(obj, dict):
        return out
    for k, v in obj.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict) and v is not None:
            out.update(_flatten_object(v, key))
        else:
            out[key] = v
    return out


def _normalise(s: str) -> str:
    """Strip separators and lowercase for comparison."""
    return s.replace("_", "").replace("-", "").replace(" ", "").lower()


def _to_camel_case(s: str) -> str:
    parts = s.replace("-", "_").split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def _field_name_similarity(a: str, b: str) -> float:
    na, nb = _normalise(a), _normalise(b)
    if na == nb:
        return 1.0
    if _to_camel_case(a).lower() == b.lower():
        return 0.95
    if _to_camel_case(b).lower() == a.lower():
        return 0.95
    if na in nb or nb in na:
        return 0.7
    # Common prefix score
    common = 0
    for ca, cb in zip(na, nb):
        if ca == cb:
            common += 1
        else:
            break
    max_len = max(len(na), len(nb))
    prefix_score = common / max_len if max_len else 0
    return prefix_score * 0.8 if prefix_score > 0.5 else 0.0


def _detect_scaling(in_val: Any, out_val: Any) -> dict[str, Any] | None:
    if not (isinstance(in_val, (int, float)) and isinstance(out_val, (int, float))):
        return None
    if in_val == 0 or out_val == 0:
        return None
    ratio = in_val / out_val
    if abs(ratio - 100) < 0.01:
        return {"type": "divide", "factor": 100}
    if abs(ratio - 1000) < 0.01:
        return {"type": "divide", "factor": 1000}
    if abs(ratio - 0.01) < 0.0001:
        return {"type": "multiply", "factor": 100}
    return None


def _generate_rules(
    input_sample: DataSample, output_sample: DataSample
) -> tuple[list[TransformationRule], float]:
    in_flat = _flatten_object(input_sample.data or {})
    out_flat = _flatten_object(output_sample.data or {})

    in_keys = list(in_flat.keys())
    out_keys = list(out_flat.keys())

    rules: list[TransformationRule] = []
    matched_out: set[str] = set()

    for out_key in out_keys:
        best_in: str | None = None
        best_score = 0.0
        for in_key in in_keys:
            score = _field_name_similarity(in_key, out_key)
            if score > best_score:
                best_score = score
                best_in = in_key

        if best_in is not None and best_score >= 0.7:
            in_val = in_flat[best_in]
            out_val = out_flat[out_key]
            scaling = _detect_scaling(in_val, out_val)

            if scaling:
                rule_type = scaling["type"]
                factor = scaling.get("factor")
            elif best_score < 1.0 and best_score >= 0.9:
                rule_type = "rename"
                factor = None
            elif type(in_val) is not type(out_val) and not (
                isinstance(in_val, (int, float)) and isinstance(out_val, (int, float))
            ):
                rule_type = "convert"
                factor = None
            else:
                rule_type = "direct"
                factor = None

            rules.append(
                TransformationRule(
                    source_field=best_in,
                    target_field=out_key,
                    type=rule_type,
                    confidence=best_score,
                    factor=factor,
                )
            )
            matched_out.add(out_key)

    # Unmatched outputs → constant
    for out_key in out_keys:
        if out_key not in matched_out:
            rules.append(
                TransformationRule(
                    source_field="",
                    target_field=out_key,
                    type="constant",
                    confidence=0.4,
                )
            )

    accuracy = (
        min(sum(r.confidence for r in rules) / len(rules), 0.99) if rules else 0.0
    )
    return rules, accuracy


def _apply_rules(input_data: Any, rules: list[TransformationRule]) -> dict[str, Any]:
    in_flat = _flatten_object(input_data or {})
    out: dict[str, Any] = {}

    for rule in rules:
        if rule.type == "constant":
            _set_nested(out, rule.target_field, None)
            continue

        value = in_flat.get(rule.source_field)
        if value is None:
            continue

        if rule.type == "divide" and rule.factor and isinstance(value, (int, float)):
            value = value / rule.factor
        elif rule.type == "multiply" and rule.factor and isinstance(value, (int, float)):
            value = value * rule.factor
        elif rule.type == "convert":
            value = str(value)

        _set_nested(out, rule.target_field, value)

    return out


def _set_nested(obj: dict[str, Any], key: str, value: Any) -> None:
    """Write a dot-notation key into a nested dict."""
    parts = key.split(".")
    cursor = obj
    for part in parts[:-1]:
        if part not in cursor or not isinstance(cursor[part], dict):
            cursor[part] = {}
        cursor = cursor[part]
    cursor[parts[-1]] = value


# ── PipelineEngine ────────────────────────────────────────────────────────────

class PipelineEngine:
    """Manages in-memory ETL pipelines."""

    def __init__(self) -> None:
        self._pipelines: dict[str, PipelineConfig] = {}
        self._next_id = 1
        self._lock = threading.Lock()

    def create_pipeline(
        self,
        name: str,
        input_sample: DataSample,
        output_sample: DataSample,
        options: dict[str, Any] | None = None,
    ) -> PipelineConfig:
        options = options or {}
        rules, accuracy = _generate_rules(input_sample, output_sample)

        with self._lock:
            pipeline_id = f"pipeline_{self._next_id}"
            self._next_id += 1

        pipeline = PipelineConfig(
            id=pipeline_id,
            name=name,
            input_sample=input_sample,
            output_sample=output_sample,
            transformation_rules=rules,
            model_config=options.get("model_config") or {"type": "auto"},
            accuracy=accuracy,
            version="1.0.0",
            created_at=datetime.now(),
            data_sources=options.get("data_sources") or [],
            etl_config=options.get("etl_options") or {},
            performance=PipelinePerformance(
                throughput=1000, latency=5, error_rate=1 - accuracy
            ),
        )

        with self._lock:
            self._pipelines[pipeline_id] = pipeline

        return pipeline

    def update_pipeline(
        self,
        pipeline_id: str,
        input_sample: DataSample | None = None,
        output_sample: DataSample | None = None,
    ) -> PipelineConfig:
        with self._lock:
            pipeline = self._pipelines.get(pipeline_id)
        if pipeline is None:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        if input_sample is not None:
            pipeline.input_sample = input_sample
        if output_sample is not None:
            pipeline.output_sample = output_sample
        if input_sample is not None or output_sample is not None:
            rules, accuracy = _generate_rules(pipeline.input_sample, pipeline.output_sample)
            pipeline.transformation_rules = rules
            pipeline.accuracy = accuracy
            pipeline.performance.error_rate = 1 - accuracy
        return pipeline

    def execute_pipeline(self, pipeline_id: str, input_data: Any) -> ExecutionResult:
        with self._lock:
            pipeline = self._pipelines.get(pipeline_id)
        if pipeline is None:
            raise ValueError(f"Pipeline {pipeline_id} not found")

        transformed = _apply_rules(input_data, pipeline.transformation_rules)
        return ExecutionResult(
            processed=True,
            data=transformed,
            timestamp=datetime.now(),
            pipeline_id=pipeline_id,
        )

    def get_pipeline(self, pipeline_id: str) -> PipelineConfig | None:
        with self._lock:
            return self._pipelines.get(pipeline_id)

    def get_all_pipelines(self) -> list[PipelineConfig]:
        with self._lock:
            return list(self._pipelines.values())

    def get_pipeline_stats(self, pipeline_id: str) -> PipelineStats:
        with self._lock:
            pipeline = self._pipelines.get(pipeline_id)
        if pipeline is None:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        return PipelineStats(
            id=pipeline.id,
            name=pipeline.name,
            performance=pipeline.performance,
            version=pipeline.version,
            last_executed=datetime.now(),
        )

    def generate_pipeline_code(self, pipeline_id: str) -> str:
        with self._lock:
            pipeline = self._pipelines.get(pipeline_id)
        if pipeline is None:
            raise ValueError(f"Pipeline {pipeline_id} not found")

        fn_name = pipeline.name.replace(" ", "_")
        lines = [
            f"# Auto-generated pipeline: {pipeline.name}",
            f"# Accuracy: {pipeline.accuracy * 100:.1f}% | Rules: {len(pipeline.transformation_rules)}",
            f"def {fn_name}(input_data: dict) -> dict:",
            "    out = {}",
        ]
        for rule in pipeline.transformation_rules:
            if rule.type == "constant":
                lines.append(f"    out['{rule.target_field}'] = None  # computed — fill in manually")
            elif rule.type == "divide" and rule.factor:
                lines.append(f"    out['{rule.target_field}'] = input_data['{rule.source_field}'] / {rule.factor}")
            elif rule.type == "multiply" and rule.factor:
                lines.append(f"    out['{rule.target_field}'] = input_data['{rule.source_field}'] * {rule.factor}")
            elif rule.type == "convert":
                lines.append(f"    out['{rule.target_field}'] = str(input_data['{rule.source_field}'])")
            else:
                lines.append(
                    f"    out['{rule.target_field}'] = input_data['{rule.source_field}']"
                    f"  # {rule.type} ({int(rule.confidence * 100)}%)"
                )
        lines.append("    return out")
        return "\n".join(lines)

    def start_realtime_processing(
        self,
        pipeline_id: str,
        on_data: Callable[[ExecutionResult], None],
        interval_ms: int = 1000,
    ) -> Callable[[], None]:
        """Start a background thread that calls on_data repeatedly. Returns a stop function."""
        with self._lock:
            pipeline = self._pipelines.get(pipeline_id)
        if pipeline is None:
            raise ValueError(f"Pipeline {pipeline_id} not found")

        stop_event = threading.Event()

        def _run() -> None:
            while not stop_event.wait(interval_ms / 1000):
                result = self.execute_pipeline(pipeline_id, pipeline.input_sample.data)
                on_data(result)

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        return stop_event.set

    def get_pipeline_execution_mode(self, _pipeline_id: str) -> str:
        return "static"

    def is_pipeline_static(self, _pipeline_id: str) -> bool:
        return True

    def pipeline_to_mindmap(self, pipeline: PipelineConfig):
        """Convert a PipelineConfig to a MindMapNode tree."""
        from .types import MindMapNode

        mode = self.get_pipeline_execution_mode(pipeline.id)
        is_static = self.is_pipeline_static(pipeline.id)
        mode_label = "Static compiled execution" if is_static else "Dynamic execution"

        children = [
            MindMapNode(
                topic="Execution Mode",
                summary=mode_label,
                skills=[f"Mode: {mode.upper()}"],
            )
        ]

        if pipeline.data_sources:
            src_children = []
            for src in pipeline.data_sources:
                t = src.get("type", "")
                conn = src.get("connection", {})
                label = conn.get("host") or conn.get("apiEndpoint") or "Local"
                src_children.append(MindMapNode(topic=t, summary=label))
            children.append(
                MindMapNode(
                    topic="Data Sources",
                    summary=f"{len(pipeline.data_sources)} connected sources",
                    children=src_children,
                )
            )

        children.append(
            MindMapNode(
                topic="Input Schema",
                summary="Data input configuration",
                skills=list(pipeline.input_sample.schema.keys()),
            )
        )

        rule_children = [
            MindMapNode(
                topic=f"{r.source_field} → {r.target_field}",
                summary=f"{r.type} ({int(r.confidence * 100)}%)",
            )
            for r in pipeline.transformation_rules
        ]
        children.append(
            MindMapNode(
                topic="Transformations",
                summary=f"{len(pipeline.transformation_rules)} rules",
                children=rule_children,
            )
        )

        children.append(
            MindMapNode(
                topic="Output Schema",
                summary="Data output configuration",
                skills=list(pipeline.output_sample.schema.keys()),
            )
        )

        return MindMapNode(
            topic=pipeline.name,
            summary=f"ETL Pipeline - Accuracy: {pipeline.accuracy * 100:.1f}%",
            skills=[f"Version: {pipeline.version}"],
            children=children,
        )
