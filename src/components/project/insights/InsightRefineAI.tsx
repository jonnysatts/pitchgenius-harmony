
import React, { useEffect } from "react";
import { useAIConversation } from "@/hooks/ai/useAIConversation";
import { 
  ChatMessages, 
  RefinedContentView, 
  MessageInput,
  extractInsightSections
} from "./AIConversation";

interface AIConversationModeProps {
  insightTitle: string;
  initialContent: Record<string, any>;
  refinedContent: Record<string, any>;
  setRefinedContent: (content: Record<string, any>) => void;
}

export const AIConversationMode: React.FC<AIConversationModeProps> = ({
  insightTitle,
  initialContent,
  refinedContent,
  setRefinedContent
}) => {
  // Use the custom hook for AI conversation logic
  const {
    messages,
    isLoadingAI,
    sendMessage
  } = useAIConversation({
    insightTitle,
    insightContent: initialContent
  });
  
  // Check for AI responses that might contain updated content
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only process AI messages
      if (lastMessage.role === 'ai') {
        try {
          // Look for JSON content in the AI message
          const jsonMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/);
          
          if (jsonMatch && jsonMatch[1]) {
            const parsedContent = JSON.parse(jsonMatch[1]);
            if (parsedContent && typeof parsedContent === 'object') {
              console.log('Found structured content in AI response:', parsedContent);
              setRefinedContent(prev => ({
                ...prev,
                ...parsedContent
              }));
            }
          } else {
            // Try to parse insight sections without JSON blocks
            const updatedContent = extractInsightSections(lastMessage.content, refinedContent);
            if (updatedContent && Object.keys(updatedContent).length > 0) {
              console.log('Extracted content from AI response:', updatedContent);
              setRefinedContent(prev => ({
                ...prev,
                ...updatedContent
              }));
            }
          }
        } catch (err) {
          console.error('Error parsing structured content from AI response:', err);
        }
      }
    }
  }, [messages, setRefinedContent, refinedContent]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden py-2 space-y-2">
      {/* Display Messages Area */}
      <ChatMessages 
        messages={messages} 
        isLoadingAI={isLoadingAI} 
      />
      
      {/* Current Refined Version */}
      <RefinedContentView refinedContent={refinedContent} />
      
      {/* Input Area */}
      <MessageInput 
        isLoadingAI={isLoadingAI} 
        onSendMessage={handleSendMessage} 
      />
    </div>
  );
};
