import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export default function Auth() {
  return (
    <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-xl">
      <h2 className="text-2xl font-new-spirit font-[500] text-center mb-6 bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
        Welcome to Conversation lab creator portal
      </h2>
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#ff5923',
                brandAccent: '#e64d1c',
                inputBackground: '#1F2937',
                inputText: '#F9FAFB',
                inputBorder: '#374151',
                inputBorderFocus: '#ff5923',
                inputBorderHover: '#4B5563',
              },
            },
          },
          className: {
            container: 'supabase-container',
            button: 'supabase-button',
            input: 'supabase-input',
          },
        }}
        theme="dark"
        providers={[]}
        view="sign_in"
      />
    </div>
  );
}