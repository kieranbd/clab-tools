import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Linkedin, BarChart3, RefreshCcw } from 'lucide-react';

interface Analytics {
  date: string;
  clicks: number;
  impressions: number;
}

export default function SocialMediaDashboard() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://app.ayrshare.com/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_AYRSHARE_API_KEY}`,
          'API-Key': import.meta.env.VITE_AYRSHARE_API_KEY
        },
        body: JSON.stringify({
          platform: "linkedin",
          startDate: "2024-01-01",
          endDate: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch analytics');
      }

      const data = await response.json();
      
      const formattedData = data.data.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(),
        clicks: item.clicks || 0,
        impressions: item.impressions || 0
      }));

      setAnalytics(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-new-spirit font-[500] text-white">LinkedIn Analytics</h2>
          <Linkedin className="text-brand-500" size={24} />
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-brand-500" size={20} />
          <h3 className="text-lg font-[500] text-white">Performance Overview</h3>
        </div>
        
        <div className="h-[400px]">
          {analytics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#ff5923"
                  strokeWidth={2}
                  dot={false}
                  name="Impressions"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#e64d1c"
                  strokeWidth={2}
                  dot={false}
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              {loading ? 'Loading data...' : 'No data available'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl p-6">
          <h4 className="text-gray-400 mb-2">Total Impressions</h4>
          <p className="text-2xl font-[500] text-white">
            {analytics.reduce((sum, item) => sum + item.impressions, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6">
          <h4 className="text-gray-400 mb-2">Total Clicks</h4>
          <p className="text-2xl font-[500] text-white">
            {analytics.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}