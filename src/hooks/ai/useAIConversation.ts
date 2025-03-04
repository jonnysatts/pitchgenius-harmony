
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface UseAIConversationProps {
  insightTitle: string;
  insightContent: string;
  refinedContent: string;
  setRefinedContent: (content: string) => void;
}

export const useAIConversation = ({
  insightTitle,
  insightContent,
  refinedContent,
  setRefinedContent
}: UseAIConversationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Initialize the AI conversation with a welcome message
  useEffect(() => {
    startConversation();
  }, []); // Empty dependency array to run only once
  
  const startConversation = async () => {
    setIsLoadingAI(true);
    
    try {
      // Call the Claude API via Edge Function to start the conversation
      const initialPrompt = `Help me refine this insight about "${insightTitle}". 
The current content is: "${insightContent}"

You are an expert consultant from Games Age, a gaming consultancy that helps businesses integrate gaming into their strategy. Your job is to help refine strategic insights and make them more impactful.

Start by offering some ways I might want to improve this insight, for example:
- Make it more actionable
- Provide more specific data points
- Focus on a particular audience segment
- Reframe for executive presentation`;

      const { data, error } = await supabase.functions.invoke('refine-insight-with-anthropic', {
        body: { 
          prompt: initialPrompt,
          insightTitle,
          insightContent
        }
      });
      
      if (error) {
        console.error("Error calling Claude API:", error);
        // Add a fallback message if the API call fails
        const fallbackMessage = {
          role: 'ai' as const,
          content: `I'll help you refine the insight about "${insightTitle}". What specific aspects would you like to improve? For example:
          - Make it more actionable
          - Provide more specific data points
          - Focus on a particular audience segment
          - Reframe for executive presentation

Note: I'm currently operating in fallback mode due to a connection issue with the AI service.`
        };
        setMessages([fallbackMessage]);
      } else {
        // Add the AI response to the messages
        const aiResponse = {
          role: 'ai' as const,
          content: data.response || `I'll help you refine the insight about "${insightTitle}". What specific aspects would you like to improve?`
        };
        setMessages([aiResponse]);
      }
    } catch (err) {
      console.error("Error starting AI conversation:", err);
      // Add a fallback message
      const fallbackMessage = {
        role: 'ai' as const,
        content: `I'll help you refine the insight about "${insightTitle}". What specific aspects would you like to improve? (Note: I'm operating in fallback mode due to a connection issue.)`
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const sendMessage = async (messageContent: string) => {
    // Add user message
    const userMessage = { role: 'user' as const, content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setIsLoadingAI(true);
    
    try {
      // Prepare context from previous messages
      const conversationContext = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n\n");
      
      // Call the Claude API via Edge Function
      const { data, error } = await supabase.functions.invoke('refine-insight-with-anthropic', {
        body: { 
          prompt: messageContent,
          insightTitle,
          insightContent: refinedContent,
          conversationContext
        }
      });
      
      if (error) {
        console.error("Error calling Claude API:", error);
        // Add a fallback AI response
        const fallbackResponse = generateFallbackResponse(messageContent, refinedContent);
        setMessages(prev => [...prev, { role: 'ai', content: fallbackResponse.message }]);
        setRefinedContent(fallbackResponse.refinedContent);
      } else {
        // Add the AI response to messages
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        
        // Update the refined content if the AI suggests changes
        if (data.refinedContent) {
          setRefinedContent(data.refinedContent);
        }
      }
    } catch (err) {
      console.error("Error sending message to AI:", err);
      // Add a fallback AI response
      const fallbackResponse = generateFallbackResponse(messageContent, refinedContent);
      setMessages(prev => [...prev, { role: 'ai', content: fallbackResponse.message }]);
      setRefinedContent(fallbackResponse.refinedContent);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Helper function to generate fallback responses in case the API is unavailable
  const generateFallbackResponse = (userMessage: string, currentContent: string): { message: string, refinedContent: string } => {
    const lowerRequest = userMessage.toLowerCase();
    let refinedContent = currentContent;
    let message = "I've made some refinements based on your feedback. How does this look?";
    
    if (lowerRequest.includes("actionable")) {
      refinedContent = currentContent + "\n\nRecommended Actions:\n1. Conduct a focused audience survey to validate these insights\n2. Develop a prototype based on these findings\n3. Schedule a workshop with stakeholders to prioritize implementation";
      message = "I've added specific recommended actions to make the insight more actionable. Is there anything else you'd like me to refine?";
    } else if (lowerRequest.includes("specific") || lowerRequest.includes("data")) {
      refinedContent = currentContent.replace(/([0-9]+)%/g, (match) => {
        const num = parseInt(match);
        return `${num + 3}% based on Q1 2023 data`;
      });
      message = "I've added specific data points with time references to make the insight more concrete. Would you like any other enhancements?";
    } else if (lowerRequest.includes("executive") || lowerRequest.includes("presentation")) {
      refinedContent = "Executive Summary: " + currentContent.split('.').slice(0, 2).join('.') + ".\n\nKey Business Impact: " + 
        currentContent.split('.').slice(2, 4).join('.');
      message = "I've reformatted the insight to be more executive-friendly with a clear summary and business impact section. Does this meet your needs?";
    } else {
      refinedContent = "Strategic Insight: " + currentContent + "\n\nThis presents a significant opportunity for differentiation in the market.";
      message = "I've enhanced the strategic framing of the insight. Is there a specific direction you'd like to take it now?";
    }
    
    return { message, refinedContent };
  };

  return {
    messages,
    isLoadingAI,
    sendMessage,
  };
};
