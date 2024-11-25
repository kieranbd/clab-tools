import { useState } from 'react';
import { ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExistingVideoSelector from '../components/ExistingVideoSelector';

export default function VideoTranscriber() {
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [options, setOptions] = useState({
    response_format: 'text',
    timestamp_granularities: ['segment']
  });

  const handleExistingVideoSelect = (url: string) => {
    setSelectedVideo(url);
  };

  const handleTranscribe = async () => {
    if (!selectedVideo) return;
    setLoading(true);
    setTranscription('');

    try {
      const response = await fetch('/.netlify/functions/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: selectedVideo,
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.text);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to transcribe video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-new-spirit font-[500]">Video Transcriber</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-[500] mb-4">Select Video to Transcribe</h2>
          <ExistingVideoSelector
            onSelect={handleExistingVideoSelect}
            selected={selectedVideo}
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-[500] mb-4">Transcription Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Response Format
              </label>
              <select
                value={options.response_format}
                onChange={(e) => setOptions({
                  ...options,
                  response_format: e.target.value as any
                })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="text">Plain Text</option>
                <option value="srt">SRT Subtitles</option>
                <option value="vtt">VTT Subtitles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Timestamp Granularity
              </label>
              <select
                value={options.timestamp_granularities[0]}
                onChange={(e) => setOptions({
                  ...options,
                  timestamp_granularities: [e.target.value as 'segment' | 'word']
                })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="segment">By Segment</option>
                <option value="word">By Word</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleTranscribe}
            disabled={loading || !selectedVideo}
            className="mt-6 w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Transcribing...
              </>
            ) : (
              'Transcribe Video'
            )}
          </button>
        </div>

        {transcription && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-[500]">Transcription Result</h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                {transcription}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}