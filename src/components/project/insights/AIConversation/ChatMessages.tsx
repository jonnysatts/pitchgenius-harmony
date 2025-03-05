
import React, { useRef, useEffect } from "react";
import { Loader2, CornerDownRight } from "lucide-react";
import { Message } from "@/hooks/ai/useAIConversation";
import { Button } from "@/components/ui/button";

interface ChatMessagesProps {
  messages: Message[];
  isLoadingAI: boolean;
  onQuickReply?: (section: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoadingAI,
  onQuickReply
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Suggested quick replies for continuing the conversation
  const quickReplies = [
    { label: "Refine title", section: "title" },
    { label: "Improve summary", section: "summary" },
    { label: "Enhance details", section: "details" },
    { label: "Add more evidence", section: "evidence" },
    { label: "Strengthen impact", section: "impact" },
    { label: "Better recommendations", section: "recommendations" }
  ];

  return (
    <div 
      ref={chatContainerRef} 
      className="flex-1 overflow-y-auto pr-2 mb-2 max-h-[300px] min-h-[200px]"
    >
      <div className="space-y-3">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'ai' 
                ? 'bg-slate-100 mr-8' 
                : 'bg-purple-100 ml-8'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words overflow-visible w-full">
              {message.content}
            </p>
            
            {/* Show quick replies after AI messages if we have the callback */}
            {message.role === 'ai' && index === messages.length - 1 && onQuickReply && (
              <div className="mt-3 flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <Button 
                    key={reply.section}
                    variant="outline" 
                    size="sm" 
                    className="text-xs py-1 px-2 h-auto"
                    onClick={() => onQuickReply(reply.section)}
                  >
                    <CornerDownRight className="h-3 w-3 mr-1" />
                    {reply.label}
                  </Button>
                ))}
              </div>
            )}
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
  );
};
