# AI Development Process

## Development assistance
AI is used as an engineering assistant for planning, implementation support, documentation, review and test design.

## Product AI
Product-level AI analysis is a separate concern. When an actual LLM provider is integrated, model-produced results must be clearly identified and validated.

## Transparency rule
The application must distinguish:
- AI-assisted software development
- actual model inference
- deterministic/rule-based analysis
- human decisions

Simulated results must never be presented as genuine model inference.

## Model-provider configuration choice
A real runtime LLM provider can be enabled via an untracked local environment file. The developer chose to reuse an existing Google AI Studio Free-tier project instead of opening billing. The application defaults to offline classification and only labels validated live provider responses as actual LLM output. Do not claim that the real Gemini connection was tested until a credential-backed test has been performed and recorded.
