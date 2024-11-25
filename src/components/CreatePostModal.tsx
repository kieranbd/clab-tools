import { useState, useRef } from 'react';
import { X, Upload, Type, Video } from 'lucide-react';

interface CreatePostModalProps {
  date: Date;
  onClose: () => void;
  onSubmit: (post: { content: string; date: Date; mediaUrl?: string; type: 'text' | 'video' }) => void;
}

export default function CreatePostModal({ date, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'video'>('text');
  const [time, setTime] = useState('09:00');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let mediaUrl;
      if (postType === 'video' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('platforms', 'linkedin');

        const response = await fetch('https://app.ayrshare.com/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AYRSHARE_API_KEY}`,
            'API-Key': import.meta.env.VITE_AYRSHARE_API_KEY
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload video');
        }

        mediaUrl = data.mediaUrl;
      }

      // Combine date and time
      const [hours, minutes] = time.split(':');
      const scheduledDate = new Date(date);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0);

      onSubmit({
        content,
        date: scheduledDate,
        mediaUrl,
        type: postType,
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to schedule post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-new-spirit font-bold">
            Schedule Post for {date.toLocaleDateString()}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex gap-4 p-1 bg-gray-900 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setPostType('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors
                  ${postType === 'text' ? 'bg-gray-800 shadow-md' : 'hover:bg-gray-800/50'}`}
              >
                <Type size={18} />
                Text Post
              </button>
              <button
                type="button"
                onClick={() => setPostType('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors
                  ${postType === 'video' ? 'bg-gray-800 shadow-md' : 'hover:bg-gray-800/50'}`}
              >
                <Video size={18} />
                Video Post
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-400 mb-2">
              Post Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            {postType === 'video' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Video File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-4 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload size={24} />
                    {selectedFile ? (
                      <span>{selectedFile.name}</span>
                    ) : (
                      <span>Click to upload video (max 100MB)</span>
                    )}
                  </div>
                </button>
              </div>
            )}

            <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-2">
              Post Copy
            </label>
            <textarea
              id="content"
              rows={4}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to share?"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || (postType === 'video' && !selectedFile)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Schedule Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}