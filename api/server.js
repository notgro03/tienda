import express from 'express';
import cors from 'cors';
import multer from 'multer';

/**
 * API mínima para Voice Search
 * Endpoints:
 *   - POST /api/transcribe  -> { text }
 *   - POST /api/answer      -> { answer }
 *
 * En producción:
 *   - Conecta /api/transcribe a un STT (Whisper, etc.)
 *   - Conecta /api/answer a tu buscador + LLM
 */
const app = express();
app.use(cors());
app.use(express.json());

// Subida de audio (fallback cuando no hay Web Speech API)
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  // TODO: enviar req.file.buffer a un proveedor STT real
  return res.json({ text: 'consulta transcrita (demo)' });
});

app.post('/api/answer', async (req, res) => {
  const query = (req.body?.query || '').trim();
  if (!query) return res.json({ answer: 'Decime qué buscás 😉' });
  // TODO: integrar buscador + LLM
  const demo = `Buscaste: “${query}”. Esto es una respuesta de ejemplo.\nConectá /api/answer a tu buscador + LLM para respuestas reales.`;
  return res.json({ answer: demo });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API lista en http://localhost:${PORT}`);
});
