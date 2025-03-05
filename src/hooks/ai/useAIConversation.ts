
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Define message types
export interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface UseAIConversationParams {
  insightTitle: string;
  insightContent: Record<string, any>;
}

export const useAIConversation = ({ insightTitle, insightContent }: UseAIConversationParams) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: `I'm here to help you refine the insight "${insightTitle}". What would you like to improve or modify about it?`
    }
  ]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const sendMessage = useCallback(async (messageContent: string) => {
    // Add user message to the conversation
    const userMessage: Message = {
      role: 'user',
      content: messageContent
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoadingAI(true);
    
    try {
      console.log('Sending message to AI:', messageContent);
      console.log('Current insight content:', insightContent);
      
      // Convert the current messages for context
      const conversationContext = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      // Add the new user message
      conversationContext.push({
        role: 'user',
        content: messageContent
      });
      
      // Call the Supabase Edge Function
      const response = await supabase.functions.invoke('refine-insight-with-anthropic', {
        body: {
          insightTitle,
          insightContent,
          messages: conversationContext
        },
      });
      
      if (response.error) {
        throw new Error(`API error: ${response.error.message}`);
      }
      
      const data = response.data;
      console.log('AI response:', data);
      
      if (!data || (!data.response && !data.aiResponse)) {
        throw new Error('Empty response from AI service');
      }
      
      // Add AI response to messages
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.response || data.aiResponse || 'Sorry, I could not generate a response.'
      }]);
      
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoadingAI(false);
    }
  }, [messages, insightTitle, insightContent]);

  return {
    messages,
    isLoadingAI,
    sendMessage
  };
};
