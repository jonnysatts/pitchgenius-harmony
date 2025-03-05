
import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Message } from "@/hooks/ai/useAIConversation";

interface ChatMessagesProps {
  messages: Message[];
  isLoadingAI: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoadingAI 
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
