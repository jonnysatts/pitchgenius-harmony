
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useAIConversation } from "@/hooks/ai/useAIConversation";

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
  const [currentMessage, setCurrentMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Use the custom hook for AI conversation logic
  const {
    messages,
    isLoadingAI,
    sendMessage
  } = useAIConversation({
    insightTitle,
    insightContent: initialContent
  });
  
  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    sendMessage(currentMessage);
    setCurrentMessage("");
  };

  // Helper function to extract structured content from free-form text
  const extractInsightSections = (text: string, currentContent: Record<string, any>) => {
    const updates: Record<string, any> = {};
    
    // Look for common section headers in AI responses
    const titleMatch = text.match(/Title:(.+?)(?=Summary:|Details:|Evidence:|Impact:|Recommendations:|$)/is);
    if (titleMatch && titleMatch[1]?.trim()) {
      updates.title = titleMatch[1].trim();
    }
    
    const summaryMatch = text.match(/Summary:(.+?)(?=Details:|Evidence:|Impact:|Recommendations:|$)/is);
    if (summaryMatch && summaryMatch[1]?.trim()) {
      updates.summary = summaryMatch[1].trim();
    }
    
    const detailsMatch = text.match(/Details:(.+?)(?=Evidence:|Impact:|Recommendations:|$)/is);
    if (detailsMatch && detailsMatch[1]?.trim()) {
      updates.details = detailsMatch[1].trim();
    }
    
    const evidenceMatch = text.match(/Evidence:(.+?)(?=Impact:|Recommendations:|$)/is);
    if (evidenceMatch && evidenceMatch[1]?.trim()) {
      updates.evidence = evidenceMatch[1].trim();
    }
    
    const impactMatch = text.match(/Impact:(.+?)(?=Recommendations:|$)/is);
    if (impactMatch && impactMatch[1]?.trim()) {
      updates.impact = impactMatch[1].trim();
    }
    
    const recommendationsMatch = text.match(/Recommendations:(.+?)$/is);
    if (recommendationsMatch && recommendationsMatch[1]?.trim()) {
      updates.recommendations = recommendationsMatch[1].trim();
    }
    
    return updates;
  };

  // Helper function to render the current state of each section
  const renderCurrentSection = (title: string, fieldKey: string) => (
    <div>
      <h5 className="text-xs font-semibold text-slate-600">{title}</h5>
      <p className="text-xs text-slate-700 whitespace-pre-wrap">
        {refinedContent[fieldKey] || "Not provided"}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden py-4 space-y-4">
      {/* Display Messages Area */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto pr-2 mb-4 max-h-[300px] min-h-[200px]"
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'ai' 
                  ? 'bg-slate-100 mr-8' 
                  : 'bg-purple-100 ml-8'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          
          {isLoadingAI && (
            <div className="bg-slate-100 p-3 rounded-lg mr-8 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <p className="text-sm">AI is thinking...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Current Refined Version */}
      <div className="mt-2 bg-slate-50 p-3 rounded border border-slate-200">
        <h4 className="text-sm font-medium mb-2">Current Refined Version</h4>
        <div className="grid gap-3 text-sm mb-4 max-h-[150px] overflow-y-auto p-2">
          {renderCurrentSection("Title", "title")}
          {renderCurrentSection("Summary", "summary")}
          {renderCurrentSection("Details", "details")}
          {renderCurrentSection("Evidence", "evidence")}
          {renderCurrentSection("Impact", "impact")}
          {renderCurrentSection("Recommendations", "recommendations")}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="flex items-center space-x-2 mt-2">
        <Textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Ask the AI how to refine this insight..."
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoadingAI}
        />
        <Button 
          size="icon" 
          onClick={handleSendMessage} 
          disabled={!currentMessage.trim() || isLoadingAI}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
