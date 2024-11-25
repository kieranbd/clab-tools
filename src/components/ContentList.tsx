import { Video, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Content {
  id: string;
  name: string;
  opening_line: string;
  transcript: string;
  video_url: string;
  created_at: string;
}

interface ContentListProps {
  content: Content[];
  onContentUpdated: () => void;
}

export default function ContentList({ content, onContentUpdated }: ContentListProps) {
  const handleDelete = async (id: string, videoUrl: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      if (videoUrl) {
        const videoPath = videoUrl.split('/').pop();
        if (videoPath) {
          await supabase.storage
            .from('content-videos')
            .remove([videoPath]);
        }
      }

      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onContentUpdated();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content. Please try again.');
    }
  };

  const getSignedUrl = async (videoUrl: string): Promise<string> => {
    try {
      const path = videoUrl.split('/').pop();
      if (!path) throw new Error('Invalid video URL');

      const { data, error } = await supabase.storage
        .from('content-videos')
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return videoUrl;
    }
  };

  if (content.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No content found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {content.map((item) => (
        <div
          key={item.id}
          className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors"
        >
          <div className="flex">
            {/* Video Section */}
            {item.video_url ? (
              <div className="w-[300px] flex-shrink-0">
                <div className="relative pt-[56.25%] bg-gray-900 overflow-hidden">
                  <video
                    controls
                    preload="none"
                    playsInline
                    className="absolute inset-0 w-full h-full"
                    controlsList="nodownload"
                    key={item.video_url}
                    poster={`${item.video_url}#t=0.1`}
                  >
                    <source 
                      src={item.video_url} 
                      type="video/mp4"
                      onError={async (e) => {
                        const target = e.target as HTMLSourceElement;
                        const video = target.parentElement as HTMLVideoElement;
                        const signedUrl = await getSignedUrl(item.video_url);
                        if (signedUrl !== item.video_url) {
                          video.src = signedUrl;
                          video.load();
                        }
                      }}
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            ) : (
              <div className="w-[300px] flex-shrink-0">
                <div className="relative pt-[56.25%] bg-gray-900">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                    <Video size={32} />
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="flex-1 min-w-0 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-new-spirit font-[500] truncate">{item.name}</h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {item.opening_line && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Opening line</h4>
                        <p className="text-gray-300">{item.opening_line}</p>
                      </div>
                    )}

                    {item.transcript && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Transcript</h4>
                        <div className="bg-gray-900 rounded-lg p-3">
                          <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-4">
                            {item.transcript}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id, item.video_url)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}