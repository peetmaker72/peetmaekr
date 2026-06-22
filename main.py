#!/usr/bin/env python3
"""
NotebookLM Integration CLI
--------------------------
Interactive command-line tool for document Q&A, summarization,
and audio overview generation via the Gemini API.
"""

import sys
from dotenv import load_dotenv
from notebooklm import NotebookLM

HELP = """
Commands:
  add-file <path>              Upload a local file (PDF, TXT, DOCX, …)
  add-url  <url>               Add a web page as a source
  add-text <text>              Add an inline text snippet as a source
  sources                      List all loaded sources
  clear                        Remove all sources

  query <question>             One-shot Q&A about the sources
  chat  <message>              Multi-turn conversational Q&A
  summarize [style]            Summarize sources
                               Styles: comprehensive (default), brief, bullet, executive
  notes                        Generate structured study notes
  audio                        Generate a podcast-style dialogue script

  help                         Show this help
  exit / quit                  Exit the program
"""


def run_cli(notebook: NotebookLM) -> None:
    print("=== NotebookLM Integration ===")
    print("Type 'help' for available commands.\n")

    while True:
        try:
            raw = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            notebook.clear_sources()
            break

        if not raw:
            continue

        parts = raw.split(None, 1)
        cmd = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""

        try:
            if cmd in ("exit", "quit"):
                notebook.clear_sources()
                break

            elif cmd == "help":
                print(HELP)

            elif cmd == "add-file":
                if not arg:
                    print("Usage: add-file <path>")
                else:
                    notebook.add_file(arg)

            elif cmd == "add-url":
                if not arg:
                    print("Usage: add-url <url>")
                else:
                    notebook.add_url(arg)

            elif cmd == "add-text":
                if not arg:
                    print("Usage: add-text <text>")
                else:
                    notebook.add_text(arg)

            elif cmd == "sources":
                names = notebook.list_sources()
                if names:
                    print("Loaded sources:")
                    for name in names:
                        print(f"  • {name}")
                else:
                    print("No sources loaded yet.")

            elif cmd == "clear":
                notebook.clear_sources()

            elif cmd == "query":
                if not arg:
                    print("Usage: query <question>")
                else:
                    print(notebook.query(arg))

            elif cmd == "chat":
                if not arg:
                    print("Usage: chat <message>")
                else:
                    print(notebook.chat(arg))

            elif cmd == "summarize":
                style = arg if arg in ("comprehensive", "brief", "bullet", "executive") else "comprehensive"
                print(notebook.summarize(style))

            elif cmd == "notes":
                print(notebook.generate_notes())

            elif cmd == "audio":
                print(notebook.audio_overview())

            else:
                print(f"Unknown command: '{cmd}'. Type 'help' for a list of commands.")

        except RuntimeError as exc:
            print(f"Error: {exc}")
        except Exception as exc:
            print(f"Unexpected error: {exc}")


if __name__ == "__main__":
    load_dotenv()
    try:
        notebook = NotebookLM()
    except ValueError as exc:
        print(f"Configuration error: {exc}")
        sys.exit(1)

    run_cli(notebook)
