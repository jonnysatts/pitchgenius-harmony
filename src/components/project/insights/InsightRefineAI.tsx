
import React, { useEffect, useState } from "react";
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
  // State for prefilled message text when using quick replies
  const [prefilledText, setPrefilledText] = useState("");
  
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
          // First, look for JSON content in the AI message
          const jsonMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/);
          
          if (jsonMatch && jsonMatch[1]) {
            const parsedContent = JSON.parse(jsonMatch[1]);
            if (parsedContent && typeof parsedContent === 'object') {
              console.log('Found structured content in AI response:', parsedContent);
              setRefinedContent({
                ...initialContent,
                ...parsedContent
              });
            }
          } else {
            // Try to parse insight sections without JSON blocks
            const updatedContent = extractInsightSections(lastMessage.content, initialContent);
            if (updatedContent && Object.keys(updatedContent).length > 0) {
              console.log('Extracted content from AI response:', updatedContent);
              setRefinedContent({
                ...initialContent,
                ...updatedContent
              });
            }
          }
        } catch (err) {
          console.error('Error parsing structured content from AI response:', err);
        }
      }
    }
  }, [messages, setRefinedContent, initialContent]);

  // Handle sending a message
  const handleSendMessage = (message: string) => {
    console.log("Sending message to AI:", message);
    sendMessage(message);
    // Clear any prefilled text after sending
    setPrefilledText("");
  };

  // Generate a quick reply message based on the section
  const handleQuickReply = (section: string) => {
    const sectionLabels: Record<string, string> = {
      title: "Title",
      summary: "Summary",
      details: "Details", 
      evidence: "Evidence",
      impact: "Impact",
      recommendations: "Recommendations"
    };
    
    const currentContent = refinedContent[section] || initialContent[section] || "not yet provided";
    
    // Prefill a message that asks for improvement for the selected section
    const message = `Can you help me improve the ${sectionLabels[section]} section? Currently it says: "${currentContent}". I'd like it to be more specific and impactful.`;
    
    setPrefilledText(message);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-3">
      {/* Display Messages Area */}
      <ChatMessages 
        messages={messages} 
        isLoadingAI={isLoadingAI}
        onQuickReply={handleQuickReply}
      />
      
      {/* Current Refined Version */}
      <RefinedContentView refinedContent={refinedContent} />
      
      {/* Input Area */}
      <MessageInput 
        isLoadingAI={isLoadingAI} 
        onSendMessage={handleSendMessage}
        prefilledText={prefilledText}
      />
    </div>
  );
};
