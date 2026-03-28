"""Type definitions for nodeqmindmap — mirrors types.ts."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class MindMapNode:
    topic: str
    summary: str = ""
    skills: list[str] = field(default_factory=list)
    children: list["MindMapNode"] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {"topic": self.topic}
        if self.summary:
            d["summary"] = self.summary
        if self.skills:
            d["skills"] = self.skills
        if self.children:
            d["children"] = [c.to_dict() for c in self.children]
        return d


@dataclass
class DataSample:
    format: str
    schema: dict[str, Any]
    data: Any
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class TransformationRule:
    source_field: str
    target_field: str
    type: str
    confidence: float


@dataclass
class PipelinePerformance:
    throughput: float = 100.0   # records/sec
    latency: float = 50.0       # ms
    error_rate: float = 0.01    # 0–1


@dataclass
class PipelineConfig:
    id: str
    name: str
    input_sample: DataSample
    output_sample: DataSample
    transformation_rules: list[TransformationRule]
    model_config: dict[str, Any]
    accuracy: float
    version: str
    created_at: datetime
    data_sources: list[dict[str, Any]] = field(default_factory=list)
    etl_config: dict[str, Any] = field(default_factory=dict)
    performance: PipelinePerformance = field(default_factory=PipelinePerformance)


@dataclass
class ExecutionResult:
    processed: bool
    data: Any
    timestamp: datetime
    pipeline_id: str


@dataclass
class PipelineStats:
    id: str
    name: str
    performance: PipelinePerformance
    version: str
    last_executed: datetime
