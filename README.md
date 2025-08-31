# Tienda Voice Search

This repository contains a simple press-and-hold voice search interface with a minimal Express backend.

## Run the API locally

Install dependencies and start the server:

    npm install
    npm start

The API listens on port 3001 by default with endpoints:

- `POST /api/transcribe` – accepts an audio file and returns a JSON object `{ text }` (stub).
- `POST /api/answer` – accepts `{ query }` and returns `{ answer }` (stub).

## Frontend

Open `web/index.html` in your browser to try the demo. Hold down the button to speak your query; release to submit. The browser tries to use the Web Speech API for real-time transcription if available, otherwise it falls back to recording and sending audio to `/api/transcribe`. The answer is obtained via `/api/answer` and can be read aloud.

If you have a React setup, you can import the `VoiceSearch.jsx` component from `react-src/VoiceSearch.jsx`.

## Next steps

You can connect `/api/transcribe` to a real speech-to-text service (e.g. OpenAI Whisper) and `/api/answer` to a search engine + language model for real results.
