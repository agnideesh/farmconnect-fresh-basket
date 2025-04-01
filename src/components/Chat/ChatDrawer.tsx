
import React, { useState, useRef, useEffect } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, X, Bot, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ open, onOpenChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsError(false);

    try {
      // Add all previous messages for context
      const chatHistory = [...messages, userMessage];
      
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { 
          messages: chatHistory
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        setIsError(true);
        throw new Error(error.message);
      }
      
      if (data.error) {
        console.error("Gemini API error:", data.error);
        setIsError(true);
        toast({
          title: "AI Assistant Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] max-h-[85vh] flex flex-col">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Chat Assistant
          </DrawerTitle>
          <DrawerClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DrawerClose>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground my-12">
              <Bot className="w-12 h-12 mx-auto mb-4 text-primary/60" />
              <p className="text-lg font-medium">How can I help you today?</p>
              <p className="text-sm mt-2">Ask me anything about farming, produce, or our services.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                    {msg.role === 'user' ? (
                      <>
                        <span>You</span>
                        <User className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3" />
                        <span>Assistant</span>
                      </>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isError && (
            <div className="flex justify-center my-2">
              <div className="bg-destructive/10 text-destructive rounded-md p-2 flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>There was an error connecting to the assistant. Please try again.</span>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                  <Bot className="w-3 h-3" />
                  <span>Assistant</span>
                </div>
                <div className="flex space-x-2 items-center h-6">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <DrawerFooter className="border-t pt-4">
          <div className="flex items-start gap-2">
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="resize-none min-h-[80px]"
              disabled={isLoading}
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatDrawer;
