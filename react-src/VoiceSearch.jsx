import { useState, useEffect, useRef } from 'react';

export default function VoiceSearch() {
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.interimResults = true;
      recognition.lang = 'es-ES';
      recognition.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join('');
        setTranscript(text);
      };
      recognition.onend = () => {
        const t = transcript.trim();
        if (t) handleQuery(t);
      };
      recognitionRef.current = recognition;
      setUseWebSpeech(true);
    }
  }, [transcript]);

  const handlePointerDown = async () => {
    setTranscript('');
    setAnswer('');
    if (useWebSpeech) {
      recognitionRef.current?.start();
      setListening(true);
    } else {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;
      setListening(true);
    }
  };

  const handlePointerUp = async () => {
    if (useWebSpeech) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          const data = await res.json();
          const text = data.text || '';
          setTranscript(text);
          if (text) handleQuery(text);
        };
        recorder.stop();
        setListening(false);
      }
    }
  };

  const handleQuery = async (query) => {
    setAnswer('Buscando...');
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setAnswer(data.answer || 'Sin respuesta');
    } catch (err) {
      setAnswer('Error al obtener la respuesta');
    }
  };

  const speakAnswer = () => {
    if (!answer) return;
    const utter = new SpeechSynthesisUtterance(answer);
    utter.lang = 'es-ES';
    speechSynthesis.speak(utter);
  };

  return (
    <div className="max-w-md mx-auto p-4 shadow-md rounded-lg bg-white text-center">
      <h1 className="text-2xl font-bold mb-2">Buscador por Voz</h1>
      <p className="mb-4">Mantené presionado para hablar y soltá para enviar la consulta.</p>
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={`px-4 py-2 rounded text-white ${listening ? 'bg-blue-700' : 'bg-blue-500'}`}
      >
        {listening ? 'Escuchando...' : 'Mantené para hablar'}
      </button>
      <div className="mt-4 min-h-[48px] border-b pb-2">{transcript}</div>
      <div className="mt-2 min-h-[60px]">{answer}</div>
      {answer && (
        <button onClick={speakAnswer} className="mt-2 px-3 py-1 bg-green-500 text-white rounded">
          🔊 Escuchar respuesta
        </button>
      )}
    </div>
  );
}
