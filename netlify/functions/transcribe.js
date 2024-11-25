import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import FormData from 'form-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers
    };
  }

  try {
    const { videoUrl, options } = JSON.parse(event.body);

    if (!videoUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Video URL is required' }),
        headers
      };
    }

    // Download the video file
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch video file');
    }

    const buffer = await response.buffer();

    // Create form data
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: 'audio.mp4',
      contentType: 'video/mp4'
    });
    formData.append('model', 'whisper-1');

    // Add options to form data
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
    }

    // Make direct request to OpenAI API
    const transcription = await openai.audio.transcriptions.create({
      file: buffer,
      model: 'whisper-1',
      ...options
    });

    return {
      statusCode: 200,
      body: JSON.stringify(transcription),
      headers
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to transcribe video: ' + error.message 
      }),
      headers
    };
  }
};