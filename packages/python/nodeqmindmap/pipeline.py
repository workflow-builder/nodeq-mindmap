"""PipelineEngine — mirrors pipeline-engine.ts."""

from __future__ import annotations

import threading
from datetime import datetime
from typing import Any

from .types import (
    DataSample,
    ExecutionResult,
    PipelineConfig,
    PipelinePerformance,
    PipelineStats,
    TransformationRule,
)


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
        with self._lock:
            pipeline_id = f"pipeline_{self._next_id}"
            self._next_id += 1

        model_config: dict[str, Any] = options.get("model_config") or {"type": "auto"}
        data_sources: list[dict[str, Any]] = options.get("data_sources") or []
        etl_config: dict[str, Any] = options.get("etl_options") or {}

        pipeline = PipelineConfig(
            id=pipeline_id,
            name=name,
            input_sample=input_sample,
            output_sample=output_sample,
            transformation_rules=[],
            model_config=model_config,
            accuracy=0.85,
            version="1.0.0",
            created_at=datetime.now(),
            data_sources=data_sources,
            etl_config=etl_config,
            performance=PipelinePerformance(throughput=100, latency=50, error_rate=0.01),
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
        return pipeline

    def execute_pipeline(self, pipeline_id: str, input_data: Any) -> ExecutionResult:
        with self._lock:
            exists = pipeline_id in self._pipelines
        if not exists:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        return ExecutionResult(
            processed=True,
            data=input_data,
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
        return (
            f"# Generated pipeline code for {pipeline.name}\n"
            f"def {fn_name}(input_data):\n"
            f"    # TODO: add transformation logic\n"
            f"    return input_data\n"
        )

    def get_pipeline_execution_mode(self, _pipeline_id: str) -> str:
        return "static"

    def is_pipeline_static(self, _pipeline_id: str) -> bool:
        return True

    def pipeline_to_mindmap(self, pipeline: PipelineConfig):
        """Convert a PipelineConfig to a MindMapNode tree (import delayed to avoid circular)."""
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
