"""JsonSchemaAdapter — mirrors json-adapter.ts / JsonSchemaAdapter in index.ts."""

from __future__ import annotations

from typing import Any

from .types import MindMapNode

_KNOWN_KEYS = {"topic", "title", "name", "summary", "description", "skills", "children"}


class JsonSchemaAdapter:
    """Converts arbitrary Python dicts/lists into a MindMapNode tree."""

    @staticmethod
    def convert_to_standard(data: Any) -> MindMapNode:
        if not isinstance(data, dict):
            return MindMapNode(topic=str(data) if data is not None else "Invalid Data")

        topic = (
            data.get("topic")
            or data.get("title")
            or data.get("name")
            or "Root"
        )
        summary = data.get("summary") or data.get("description") or ""
        skills_raw = data.get("skills")
        skills = [str(s) for s in skills_raw] if isinstance(skills_raw, list) else []

        root = MindMapNode(topic=topic, summary=summary, skills=skills)

        # Explicit children
        if isinstance(data.get("children"), list):
            for child in data["children"]:
                root.children.append(JsonSchemaAdapter.convert_to_standard(child))

        # Remaining keys as child nodes
        for key, value in data.items():
            if key in _KNOWN_KEYS:
                continue
            if value is None:
                continue
            if isinstance(value, dict):
                root.children.append(
                    MindMapNode(
                        topic=key,
                        children=[JsonSchemaAdapter.convert_to_standard(value)],
                    )
                )
            elif isinstance(value, list):
                items = value[:20]
                child = MindMapNode(
                    topic=key,
                    summary=f"{len(value)} item(s)",
                )
                for i, item in enumerate(items):
                    if isinstance(item, dict):
                        child.children.append(
                            MindMapNode(
                                topic=f"{key}[{i}]",
                                children=[JsonSchemaAdapter.convert_to_standard(item)],
                            )
                        )
                    else:
                        child.children.append(MindMapNode(topic=str(item)))
                root.children.append(child)
            else:
                root.children.append(MindMapNode(topic=f"{key}: {value}"))

        return root

    @staticmethod
    def extract_schema(data: Any) -> dict[str, str]:
        """Return a flat field→type mapping from a dict or list-of-dict."""
        if isinstance(data, list):
            return JsonSchemaAdapter.extract_schema(data[0]) if data else {}
        if isinstance(data, dict):
            return {k: type(v).__name__ for k, v in data.items()}
        return {}
