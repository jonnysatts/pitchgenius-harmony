
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  isLoadingAI: boolean;
  onSendMessage: (message: string) => void;
  prefilledText?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  isLoadingAI, 
  onSendMessage,
  prefilledText = ""
}) => {
  const [currentMessage, setCurrentMessage] = useState(prefilledText);

  // Update the message when prefilled text changes
  React.useEffect(() => {
    if (prefilledText) {
      setCurrentMessage(prefilledText);
    }
  }, [prefilledText]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    onSendMessage(currentMessage);
    setCurrentMessage("");
  };

  return (
    <div className="flex items-start space-x-2 mt-2">
      <Textarea
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Ask the AI how to refine this insight..."
        className="min-h-[60px] max-h-[120px] resize-none overflow-y-auto break-words"
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
        className="flex-shrink-0 mt-1"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
