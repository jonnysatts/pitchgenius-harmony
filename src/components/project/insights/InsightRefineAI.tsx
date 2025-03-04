
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useAIConversation } from "@/hooks/ai/useAIConversation";

interface AIConversationModeProps {
  insightTitle: string;
  initialContent: string;
  refinedContent: string;
  setRefinedContent: (content: string) => void;
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
    insightContent: initialContent,
    refinedContent,
    setRefinedContent
  });
  
  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    sendMessage(currentMessage);
    setCurrentMessage("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden space-y-4 py-4">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2">
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
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Current Refined Version</h4>
        <div className="bg-slate-50 p-3 rounded text-sm mb-4 whitespace-pre-wrap max-h-[150px] overflow-y-auto">
          {refinedContent}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
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
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
