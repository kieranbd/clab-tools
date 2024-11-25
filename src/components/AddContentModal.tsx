import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddContentModalProps {
  onClose: () => void;
  onContentAdded: () => void;
}

export default function AddContentModal({ onClose, onContentAdded }: AddContentModalProps) {
  const [name, setName] = useState('');
  const [openingLine, setOpeningLine] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let videoUrl = '';

      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('content-videos')
          .upload(filePath, videoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('content-videos')
          .getPublicUrl(filePath);

        videoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('content')
        .insert([
          {
            name,
            opening_line: openingLine,
            transcript,
            video_url: videoUrl,
            user_id: user.id, // Add the user_id
          },
        ]);

      if (error) throw error;

      onContentAdded();
      onClose();
    } catch (error) {
      console.error('Error adding content:', error);
      alert('Error adding content. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-new-spirit font-[500]">Add New Content</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Content Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter content name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Opening Line
              </label>
              <input
                type="text"
                value={openingLine}
                onChange={(e) => setOpeningLine(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter opening line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Transcript
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter transcript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Video File
              </label>
              <label className="block w-full px-4 py-4 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg hover:border-brand-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={24} />
                  <span>{videoFile ? videoFile.name : 'Click to upload video'}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading && <Loader2 size={18} className="animate-spin" />}
              {uploading ? 'Uploading...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}