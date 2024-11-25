import { useState } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VideoAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('https://clab-video-assistant.netlify.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error processing your request.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-new-spirit font-[500]">Video Assistant</h1>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me anything about video content creation..."
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send
                </>
              )}
            </button>
          </form>
        </div>

        {response && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: response }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}