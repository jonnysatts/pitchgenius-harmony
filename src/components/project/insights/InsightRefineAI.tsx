
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
            // Try to parse JSON content
            const parsedContent = JSON.parse(jsonMatch[1]);
            if (parsedContent && typeof parsedContent === 'object') {
              console.log('Found structured content in AI response:', parsedContent);
              
              // Important: Merge with initial content to ensure all fields are preserved
              const updatedContent = {
                ...initialContent,
                ...parsedContent
              };
              
              // Update the refined content
              setRefinedContent(updatedContent);
              console.log('Updated refined content with JSON data:', updatedContent);
            }
          } else {
            // Try to extract sections from the AI message content
            const extractedContent = extractInsightSections(lastMessage.content, initialContent);
            if (extractedContent && Object.keys(extractedContent).length > 0) {
              console.log('Extracted content from AI response:', extractedContent);
              
              // Important: Merge with initial content to ensure all fields are preserved
              const updatedContent = {
                ...initialContent,
                ...extractedContent
              };
              
              // Update the refined content
              setRefinedContent(updatedContent);
              console.log('Updated refined content with extracted data:', updatedContent);
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
    
    // Use the current content from refinedContent, falling back to initialContent
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
