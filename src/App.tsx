import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import SocialMediaScheduler from './pages/SocialMediaScheduler';
import ContentRepository from './pages/ContentRepository';
import VideoTranscriber from './pages/VideoTranscriber';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Routes>
        <Route path="/" element={<Dashboard session={session} />} />
        <Route path="/scheduler" element={<SocialMediaScheduler />} />
        <Route path="/repository" element={<ContentRepository />} />
        <Route path="/transcriber" element={<VideoTranscriber />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}