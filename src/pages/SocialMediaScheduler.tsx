import { useState } from 'react';
import Calendar from '../components/Calendar';
import CreatePostModal from '../components/CreatePostModal';
import SocialMediaDashboard from '../components/SocialMediaDashboard';

export default function SocialMediaScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePostSubmit = async (post: { 
    content: string; 
    date: Date; 
    mediaUrl?: string;
    type: 'text' | 'video';
  }) => {
    try {
      const postData: any = {
        post: post.content,
        platforms: ["linkedin"],
        scheduleDate: post.date.toISOString(),
      };

      if (post.type === 'video' && post.mediaUrl) {
        postData.mediaUrls = [post.mediaUrl];
      }

      const response = await fetch('https://app.ayrshare.com/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_AYRSHARE_API_KEY}`
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule post');
      }

      alert('Post scheduled successfully!');
      setSelectedDate(null);
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert(error instanceof Error ? error.message : 'Failed to schedule post. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-new-spirit font-[500] mb-8">Social Media Scheduler</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Calendar onDateSelect={handleDateSelect} />
          <SocialMediaDashboard />
        </div>
        
        {selectedDate && (
          <CreatePostModal
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
            onSubmit={handlePostSubmit}
          />
        )}
      </div>
    </div>
  );
}