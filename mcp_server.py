#!/usr/bin/env python3
"""
NotebookLM MCP Server
Exposes NotebookLM integration as tools that Claude Code can call natively.
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

from notebooklm import NotebookLM

app = Server("notebooklm")
_notebook: NotebookLM | None = None


def get_notebook() -> NotebookLM:
    global _notebook
    if _notebook is None:
        _notebook = NotebookLM()
    return _notebook


# ------------------------------------------------------------------ tool list

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="notebooklm_add_file",
            description="Upload a local file (PDF, TXT, DOCX, …) as a source.",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "Absolute path to the file"}
                },
                "required": ["file_path"],
            },
        ),
        types.Tool(
            name="notebooklm_add_url",
            description="Download and add a web page as a source.",
            inputSchema={
                "type": "object",
                "properties": {
                    "url":  {"type": "string", "description": "URL to fetch"},
                    "name": {"type": "string", "description": "Optional display name"},
                },
                "required": ["url"],
            },
        ),
        types.Tool(
            name="notebooklm_add_text",
            description="Add an inline text snippet as a source.",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {"type": "string", "description": "Text content"},
                    "name": {"type": "string", "description": "Optional display name"},
                },
                "required": ["text"],
            },
        ),
        types.Tool(
            name="notebooklm_query",
            description="Ask a one-shot question grounded in the loaded sources.",
            inputSchema={
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "Question to answer"}
                },
                "required": ["question"],
            },
        ),
        types.Tool(
            name="notebooklm_chat",
            description="Send a message in a multi-turn conversation grounded in the loaded sources.",
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {"type": "string", "description": "Message to send"}
                },
                "required": ["message"],
            },
        ),
        types.Tool(
            name="notebooklm_summarize",
            description="Summarize all loaded sources.",
            inputSchema={
                "type": "object",
                "properties": {
                    "style": {
                        "type": "string",
                        "enum": ["comprehensive", "brief", "bullet", "executive"],
                        "description": "Summary style (default: comprehensive)",
                    }
                },
            },
        ),
        types.Tool(
            name="notebooklm_notes",
            description="Generate structured study notes from all loaded sources.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="notebooklm_audio_overview",
            description="Generate a podcast-style Host 1 / Host 2 dialogue script from all loaded sources.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="notebooklm_list_sources",
            description="List names of all currently loaded sources.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="notebooklm_clear",
            description="Remove all loaded sources and reset the session.",
            inputSchema={"type": "object", "properties": {}},
        ),
    ]


# ---------------------------------------------------------------- tool router

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    nb = get_notebook()

    def ok(text: str) -> list[types.TextContent]:
        return [types.TextContent(type="text", text=text)]

    try:
        if name == "notebooklm_add_file":
            src = nb.add_file(arguments["file_path"])
            return ok(f"Added source: {src.name}")

        if name == "notebooklm_add_url":
            src = nb.add_url(arguments["url"], arguments.get("name"))
            return ok(f"Added URL source: {src.name}")

        if name == "notebooklm_add_text":
            src = nb.add_text(arguments["text"], arguments.get("name", "Text Source"))
            return ok(f"Added text source: {src.name}")

        if name == "notebooklm_query":
            return ok(nb.query(arguments["question"]))

        if name == "notebooklm_chat":
            return ok(nb.chat(arguments["message"]))

        if name == "notebooklm_summarize":
            return ok(nb.summarize(arguments.get("style", "comprehensive")))

        if name == "notebooklm_notes":
            return ok(nb.generate_notes())

        if name == "notebooklm_audio_overview":
            return ok(nb.audio_overview())

        if name == "notebooklm_list_sources":
            sources = nb.list_sources()
            if sources:
                return ok("Loaded sources:\n" + "\n".join(f"• {s}" for s in sources))
            return ok("No sources loaded yet.")

        if name == "notebooklm_clear":
            nb.clear_sources()
            return ok("All sources cleared.")

        return ok(f"Unknown tool: {name}")

    except Exception as exc:
        return ok(f"Error: {exc}")


# ----------------------------------------------------------------------- main

async def main() -> None:
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options(),
        )


if __name__ == "__main__":
    asyncio.run(main())
