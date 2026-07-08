from abc import ABC, abstractmethod


class TokenUsage:
    def __init__(self, prompt_tokens: int | None = None, completion_tokens: int | None = None):
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens

    @property
    def total_tokens(self) -> int | None:
        if self.prompt_tokens is not None and self.completion_tokens is not None:
            return self.prompt_tokens + self.completion_tokens
        return None

    @property
    def estimated_cost(self) -> float | None:
        if self.prompt_tokens is not None and self.completion_tokens is not None:
            prompt_cost = (self.prompt_tokens / 1000) * 0.0005
            completion_cost = (self.completion_tokens / 1000) * 0.0015
            return round(prompt_cost + completion_cost, 6)
        return None


class AIProvider(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        pass

    @abstractmethod
    async def generate_structured(self, prompt: str, output_schema: dict, **kwargs) -> dict:
        pass

    @abstractmethod
    async def stream_text(self, prompt: str, **kwargs):
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    @abstractmethod
    def get_last_token_usage(self) -> TokenUsage:
        pass
