
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import ChatDrawer from './ChatDrawer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedApiKey, setCheckedApiKey] = useState(false);
  const { toast } = useToast();

  const handleOpenChat = async () => {
    if (!checkedApiKey) {
      try {
        // Check if the Gemini API key is set by making a simple request
        const { data, error } = await supabase.functions.invoke('gemini-chat', {
          body: { messages: [{ role: 'user', content: 'hello' }] }
        });

        if (error || data.error) {
          if (data?.error?.includes('GEMINI_API_KEY is not set')) {
            toast({
              title: "API Key Missing",
              description: "The Gemini API key is not configured.",
              variant: "destructive",
            });
            return;
          }
        }
        
        setCheckedApiKey(true);
      } catch (err: any) {
        console.error("Error checking API key:", err);
        toast({
          title: "Error",
          description: "Could not connect to chat service.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      <ChatDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default ChatButton;
