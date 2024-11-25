import express from 'express';
import multer from 'multer';
import { createServer } from 'vite';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here' // Replace with your API key
});

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    const options = JSON.parse(req.body.options);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      ...options
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(transcription);
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe video' });
  }
});

// Create Vite server in middleware mode
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// Use vite's connect instance as middleware
app.use(vite.middlewares);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});