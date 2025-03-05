
import React, { useState, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update the message when prefilled text changes
  useEffect(() => {
    if (prefilledText) {
      setCurrentMessage(prefilledText);
      
      // Focus the textarea when prefilled text is updated
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [prefilledText]);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset the height first to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Set the height based on scrollHeight (with a maximum)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [currentMessage]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    onSendMessage(currentMessage);
    setCurrentMessage("");
    
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="flex items-start space-x-2 mt-2">
      <Textarea
        ref={textareaRef}
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Ask the AI how to refine this insight..."
        className="min-h-[60px] resize-none overflow-y-auto break-words"
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
