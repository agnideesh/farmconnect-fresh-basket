
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import ChatDrawer from './ChatDrawer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedApiKey, setCheckedApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
      setCheckedApiKey(true);
      setShowApiKeyInput(false);
    }
  }, [apiKey]);

  const handleOpenChat = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }
    
    // API key is set, open the chat
    setIsOpen(true);
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
        variant: "destructive",
      });
      return;
    }

    // Test the API key by making a simple request
    testApiKey(apiKey);
  };

  const testApiKey = async (key: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { 
          messages: [{ role: 'user', content: 'hello' }],
          apiKey: key
        }
      });

      if (error || data.error) {
        toast({
          title: "Invalid API Key",
          description: data?.error || "Could not validate the Gemini API key.",
          variant: "destructive",
        });
        return;
      }
      
      // API key is valid
      setApiKey(key);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });
      
      // Open the chat drawer
      setIsOpen(true);
    } catch (err: any) {
      console.error("Error checking API key:", err);
      toast({
        title: "Error",
        description: "Could not validate the API key.",
        variant: "destructive",
      });
    }
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
      
      {showApiKeyInput && (
        <div className="fixed bottom-24 right-6 bg-card p-4 rounded-lg shadow-lg border border-border w-80">
          <h3 className="text-lg font-medium mb-2">Enter Gemini API Key</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your API key will be stored in your browser only.
          </p>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Your Gemini API key"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowApiKeyInput(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveApiKey}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      
      <ChatDrawer open={isOpen} onOpenChange={setIsOpen} apiKey={apiKey} />
    </>
  );
};

export default ChatButton;
