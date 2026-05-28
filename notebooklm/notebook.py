import json
import mimetypes
import os
import time
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import requests

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
UPLOAD_BASE = "https://generativelanguage.googleapis.com/upload/v1beta"

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
    file_uri: Optional[str] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = None


class NotebookLM:
    """
    Python integration for NotebookLM-style document Q&A and summarization
    powered by the Google Gemini REST API (no SDK required).
    """

    def __init__(self, api_key: str = None, model: str = "gemini-2.0-flash"):
        self._key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not self._key:
            raise ValueError(
                "API key required. Set the GEMINI_API_KEY environment variable "
                "or pass api_key= to the constructor."
            )
        self._model = model
        self._sources: list[Source] = []
        self._history: list[dict] = []

    # ------------------------------------------------------------------ helpers

    def _params(self) -> dict:
        return {"key": self._key}

    def _generate(self, contents: list) -> str:
        url = f"{GEMINI_BASE}/models/{self._model}:generateContent"
        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": contents,
        }
        resp = requests.post(url, params=self._params(), json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

    def _source_parts(self) -> list:
        parts = []
        for source in self._sources:
            if source.file_uri:
                parts.append({
                    "fileData": {
                        "mimeType": source.mime_type or "application/octet-stream",
                        "fileUri": source.file_uri,
                    }
                })
            elif source.content:
                parts.append({"text": f"[Source: {source.name}]\n{source.content}\n"})
        return parts

    def _require_sources(self) -> None:
        if not self._sources:
            raise RuntimeError(
                "No sources added yet. Use add_file(), add_text(), or add_url() first."
            )

    # ------------------------------------------------------------------ sources

    def add_file(self, file_path: str) -> Source:
        """Upload a local file (PDF, TXT, …) as a source via the Gemini Files API."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        mime_type, _ = mimetypes.guess_type(str(path))
        mime_type = mime_type or "application/octet-stream"
        file_bytes = path.read_bytes()

        print(f"Uploading {path.name}…")

        boundary = "gemini_upload_boundary"
        metadata = json.dumps({"file": {"display_name": path.name}})
        body = (
            f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
            f"{metadata}\r\n"
            f"--{boundary}\r\nContent-Type: {mime_type}\r\n\r\n"
        ).encode() + file_bytes + f"\r\n--{boundary}--".encode()

        upload_url = f"{UPLOAD_BASE}/files"
        resp = requests.post(
            upload_url,
            params={**self._params(), "uploadType": "multipart"},
            headers={"Content-Type": f"multipart/related; boundary={boundary}"},
            data=body,
            timeout=120,
        )
        resp.raise_for_status()
        file_info = resp.json()["file"]

        while file_info.get("state") == "PROCESSING":
            time.sleep(2)
            get_resp = requests.get(
                f"{GEMINI_BASE}/{file_info['name']}",
                params=self._params(),
                timeout=30,
            )
            file_info = get_resp.json()

        if file_info.get("state") == "FAILED":
            raise RuntimeError(f"File processing failed: {path.name}")

        source = Source(
            name=path.name,
            file_uri=file_info["uri"],
            file_name=file_info["name"],
            mime_type=mime_type,
        )
        self._sources.append(source)
        self._history.clear()
        print(f"✓ Added source: {path.name}")
        return source

    def add_text(self, text: str, name: str = "Text Source") -> Source:
        """Add a plain-text string as a source."""
        source = Source(name=name, content=text)
        self._sources.append(source)
        self._history.clear()
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
        self._history.clear()
        print(f"✓ Added URL source: {name}")
        return source

    def list_sources(self) -> list[str]:
        """Return names of all loaded sources."""
        return [s.name for s in self._sources]

    def clear_sources(self) -> None:
        """Remove all sources and delete any uploaded files from Gemini."""
        for source in self._sources:
            if source.file_name:
                try:
                    requests.delete(
                        f"{GEMINI_BASE}/{source.file_name}",
                        params=self._params(),
                        timeout=15,
                    )
                except Exception:
                    pass
        self._sources.clear()
        self._history.clear()
        print("All sources cleared.")

    # ----------------------------------------------------------------- core ops

    def query(self, question: str) -> str:
        """One-shot Q&A grounded in the loaded sources."""
        self._require_sources()
        parts = self._source_parts() + [{"text": question}]
        return self._generate([{"role": "user", "parts": parts}])

    def chat(self, message: str) -> str:
        """Multi-turn conversational Q&A grounded in the loaded sources."""
        self._require_sources()
        if not self._history:
            first_parts = self._source_parts() + [{"text": message}]
            self._history.append({"role": "user", "parts": first_parts})
        else:
            self._history.append({"role": "user", "parts": [{"text": message}]})

        result = self._generate(self._history)
        self._history.append({"role": "model", "parts": [{"text": result}]})
        return result

    def summarize(self, style: str = "comprehensive") -> str:
        """
        Summarize all sources.

        style: 'comprehensive' | 'brief' | 'bullet' | 'executive'
        """
        self._require_sources()
        prompt = SUMMARY_PROMPTS.get(style, SUMMARY_PROMPTS["comprehensive"])
        parts = self._source_parts() + [{"text": prompt}]
        return self._generate([{"role": "user", "parts": parts}])

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
        parts = self._source_parts() + [{"text": prompt}]
        return self._generate([{"role": "user", "parts": parts}])

    def audio_overview(self) -> str:
        """
        Generate a podcast-style dialogue script from all sources.

        Returns a Host 1 / Host 2 conversation script suitable for
        reading aloud or feeding into a TTS engine.
        """
        self._require_sources()
        prompt = (
            "Create a natural, engaging podcast-style conversation script between two hosts "
            "discussing the key insights from these documents.\n\n"
            "Format:\nHost 1: [dialogue]\nHost 2: [dialogue]\n\n"
            "Make it conversational, informative, and engaging. "
            "Target length: ~5-7 minutes of spoken dialogue."
        )
        parts = self._source_parts() + [{"text": prompt}]
        return self._generate([{"role": "user", "parts": parts}])
