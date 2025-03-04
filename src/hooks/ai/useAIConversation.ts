
import { useState, useCallback } from 'react';

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
      
      // Use the fetch API to call our edge function
      const response = await fetch('/api/refine-insight-with-anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insightTitle,
          insightContent,
          messages: conversationContext
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AI response:', data);
      
      // Add AI response to messages
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.aiResponse || 'Sorry, I could not generate a response.'
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
