import { OpenAI } from 'openai';
import fetch from 'node-fetch';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async (event) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }

  try {
    const { videoUrl, options } = JSON.parse(event.body);

    if (!videoUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Video URL is required' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }

    // Download the video file
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch video file');
    }

    const buffer = await response.arrayBuffer();
    const file = new Blob([buffer], { type: 'video/mp4' });

    // Transcribe using OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      ...options
    });

    return {
      statusCode: 200,
      body: JSON.stringify(transcription),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to transcribe video: ' + error.message }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }
};