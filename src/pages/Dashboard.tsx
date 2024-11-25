import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import ToolCard from '../components/ToolCard';
import { tools } from '../data/tools';

interface DashboardProps {
  session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(tools.map(tool => tool.category))];

  return (
    <>
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-new-spirit font-[500] bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
              Conversation lab creator portal
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-new-spirit font-[500] mb-4">Available tools</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onClick={() => navigate(tool.url)} 
            />
          ))}
        </div>
      </main>
    </>
  );
}