import { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AddContentModal from '../components/AddContentModal';
import ContentList from '../components/ContentList';

interface Content {
  id: string;
  name: string;
  opening_line: string;
  transcript: string;
  video_url: string;
  created_at: string;
  user_id: string;
}

export default function ContentRepository() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setAuthChecked(true);
      fetchContent();
    } else {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const fetchContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.opening_line?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.transcript?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-new-spirit font-[500] text-white">Content repository</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add content
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-brand-500" size={32} />
          </div>
        ) : (
          <ContentList content={filteredContent} onContentUpdated={fetchContent} />
        )}
      </div>

      {isModalOpen && (
        <AddContentModal
          onClose={() => setIsModalOpen(false)}
          onContentAdded={fetchContent}
        />
      )}
    </div>
  );
}