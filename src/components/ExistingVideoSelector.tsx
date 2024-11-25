import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExistingVideoSelectorProps {
  onSelect: (url: string) => void;
  selected: string | null;
}

interface Video {
  id: string;
  name: string;
  video_url: string;
}

export default function ExistingVideoSelector({ onSelect, selected }: ExistingVideoSelectorProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('content')
        .select('id, name, video_url')
        .eq('user_id', user.id)
        .not('video_url', 'is', null);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-gray-800 rounded-xl">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-gray-800 rounded-xl">
        <p className="text-gray-400">No videos available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 max-h-[300px] overflow-y-auto">
      <div className="space-y-2">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onSelect(video.video_url)}
            className={`w-full p-4 rounded-lg text-left transition-colors
              ${selected === video.video_url
                ? 'bg-brand-500'
                : 'bg-gray-700 hover:bg-gray-600'
              }`}
          >
            <p className="font-medium truncate">{video.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}