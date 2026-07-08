import json
from collections.abc import AsyncGenerator

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.core.config import settings
from app.providers.base import AIProvider, TokenUsage


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str | None = None):
        self._api_key = api_key or settings.gemini_api_key
        if not self._api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        genai.configure(api_key=self._api_key)
        self._model = genai.GenerativeModel("gemini-1.5-flash")
        self._last_usage = TokenUsage()

    @property
    def provider_name(self) -> str:
        return "google-gemini"

    @property
    def model_name(self) -> str:
        return "gemini-1.5-flash"

    def get_last_token_usage(self) -> TokenUsage:
        return self._last_usage

    async def generate_text(self, prompt: str, **kwargs) -> str:
        response = await self._model.generate_content_async(prompt)
        self._capture_usage(response)
        return response.text

    async def generate_structured(self, prompt: str, output_schema: dict, **kwargs) -> dict:
        generation_config = GenerationConfig(
            response_mime_type="application/json",
            response_schema=output_schema,
        )
        model = genai.GenerativeModel("gemini-1.5-flash", generation_config=generation_config)
        response = await model.generate_content_async(prompt)
        self._capture_usage(response)
        try:
            return json.loads(response.text)
        except (json.JSONDecodeError, ValueError):
            return {"raw": response.text, "parse_error": "Failed to parse structured output"}

    async def stream_text(self, prompt: str, **kwargs) -> AsyncGenerator[str]:
        response = await self._model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text

    def _capture_usage(self, response) -> None:
        try:
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                self._last_usage = TokenUsage(
                    prompt_tokens=response.usage_metadata.prompt_token_count,
                    completion_tokens=response.usage_metadata.candidates_token_count,
                )
        except Exception:
            self._last_usage = TokenUsage()
