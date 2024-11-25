import { OpenAI } from 'openai';
import fetch from 'node-fetch';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { videoUrl, options } = JSON.parse(event.body);

    // Download the video file
    const response = await fetch(videoUrl);
    const buffer = await response.arrayBuffer();
    const file = new Blob([buffer]);

    // Transcribe using OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      ...options
    });

    return {
      statusCode: 200,
      body: JSON.stringify(transcription)
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to transcribe video' })
    };
  }
};