import os
import time
import mimetypes
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import google.generativeai as genai

SYSTEM_PROMPT = (
    "You are a helpful AI research assistant similar to NotebookLM. "
    "You help users understand their documents by answering questions, "
    "generating summaries, and extracting key insights. "
    "Always ground your responses strictly in the provided source documents. "
    "If information is not found in the sources, say so clearly."
)

SUMMARY_PROMPTS = {
    "comprehensive": (
        "Generate a comprehensive summary of all the provided documents. "
        "Include key points, main themes, important details, and any notable conclusions."
    ),
    "brief": "Generate a brief 3-5 sentence summary of the main points in these documents.",
    "bullet": "Generate a bullet-point summary of the key points in these documents.",
    "executive": (
        "Generate an executive summary suitable for a business audience. "
        "Focus on actionable insights and key decisions."
    ),
}


@dataclass
class Source:
    name: str
    content: Optional[str] = None
    file_ref: Optional[object] = None


class NotebookLM:
    """
    Python integration for NotebookLM-style document Q&A and summarization
    powered by the Google Gemini API.
    """

    def __init__(self, api_key: str = None, model: str = "gemini-2.0-flash"):
        resolved_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not resolved_key:
            raise ValueError(
                "API key required. Set the GEMINI_API_KEY environment variable "
                "or pass api_key= to the constructor."
            )
        genai.configure(api_key=resolved_key)
        self._model = genai.GenerativeModel(
            model_name=model,
            system_instruction=SYSTEM_PROMPT,
        )
        self._sources: list[Source] = []
        self._chat = None

    # ------------------------------------------------------------------ sources

    def add_file(self, file_path: str) -> Source:
        """Upload a local file (PDF, TXT, DOCX, …) as a source."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        mime_type, _ = mimetypes.guess_type(str(path))
        print(f"Uploading {path.name}…")
        uploaded = genai.upload_file(str(path), mime_type=mime_type)

        while uploaded.state.name == "PROCESSING":
            time.sleep(2)
            uploaded = genai.get_file(uploaded.name)

        if uploaded.state.name == "FAILED":
            raise RuntimeError(f"File processing failed: {path.name}")

        source = Source(name=path.name, file_ref=uploaded)
        self._sources.append(source)
        self._chat = None  # reset chat so new source is included
        print(f"✓ Added source: {path.name}")
        return source

    def add_text(self, text: str, name: str = "Text Source") -> Source:
        """Add a plain-text string as a source."""
        source = Source(name=name, content=text)
        self._sources.append(source)
        self._chat = None
        print(f"✓ Added source: {name}")
        return source

    def add_url(self, url: str, name: str = None) -> Source:
        """Download and add a URL's text content as a source."""
        if name is None:
            name = url.split("/")[-1] or url

        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read().decode("utf-8", errors="ignore")
            source = Source(name=name, content=f"Source URL: {url}\n\n{content}")
        except Exception as exc:
            print(f"Warning: could not download URL ({exc}). Adding reference only.")
            source = Source(name=name, content=f"Reference URL: {url}")

        self._sources.append(source)
        self._chat = None
        print(f"✓ Added URL source: {name}")
        return source

    def list_sources(self) -> list[str]:
        """Return names of all loaded sources."""
        return [s.name for s in self._sources]

    def clear_sources(self) -> None:
        """Remove all sources and clean up uploaded files."""
        for source in self._sources:
            if source.file_ref:
                try:
                    genai.delete_file(source.file_ref.name)
                except Exception:
                    pass
        self._sources.clear()
        self._chat = None
        print("All sources cleared.")

    # --------------------------------------------------------------- core ops

    def _parts(self, prompt: str = "") -> list:
        parts = []
        for source in self._sources:
            if source.file_ref:
                parts.append(source.file_ref)
            elif source.content:
                parts.append(f"[Source: {source.name}]\n{source.content}\n")
        if prompt:
            parts.append(prompt)
        return parts

    def _require_sources(self) -> None:
        if not self._sources:
            raise RuntimeError("No sources added yet. Use add_file(), add_text(), or add_url() first.")

    def query(self, question: str) -> str:
        """One-shot Q&A grounded in the loaded sources."""
        self._require_sources()
        response = self._model.generate_content(self._parts(question))
        return response.text

    def chat(self, message: str) -> str:
        """Multi-turn conversational Q&A grounded in the loaded sources."""
        self._require_sources()
        if self._chat is None:
            self._chat = self._model.start_chat()
            init_parts = self._parts(
                "I've shared these documents with you. Acknowledge you're ready to answer questions about them."
            )
            self._chat.send_message(init_parts)
        response = self._chat.send_message(message)
        return response.text

    def summarize(self, style: str = "comprehensive") -> str:
        """
        Summarize all sources.

        style: 'comprehensive' | 'brief' | 'bullet' | 'executive'
        """
        self._require_sources()
        prompt = SUMMARY_PROMPTS.get(style, SUMMARY_PROMPTS["comprehensive"])
        response = self._model.generate_content(self._parts(prompt))
        return response.text

    def generate_notes(self) -> str:
        """Generate structured study notes from all sources."""
        self._require_sources()
        prompt = (
            "Generate detailed study notes from these documents. Include:\n"
            "- Key concepts and definitions\n"
            "- Important facts and figures\n"
            "- Main arguments or theories\n"
            "- Review questions"
        )
        response = self._model.generate_content(self._parts(prompt))
        return response.text

    def audio_overview(self) -> str:
        """
        Generate a podcast-style dialogue script from all sources.

        Returns a Host 1 / Host 2 conversation script you can read aloud
        or feed into a TTS engine.
        """
        self._require_sources()
        prompt = (
            "Create a natural, engaging podcast-style conversation script between two hosts "
            "discussing the key insights from these documents.\n\n"
            "Format:\n"
            "Host 1: [dialogue]\n"
            "Host 2: [dialogue]\n\n"
            "Make it conversational, informative, and engaging. "
            "Target length: ~5-7 minutes of spoken dialogue."
        )
        response = self._model.generate_content(self._parts(prompt))
        return response.text
