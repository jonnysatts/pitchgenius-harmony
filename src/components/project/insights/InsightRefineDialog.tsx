
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, ArrowDown, MessageSquare } from "lucide-react";

interface InsightRefineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  insightTitle: string;
  insightContent: string;
  onRefine: (refinedContent: string) => void;
}

const InsightRefineDialog: React.FC<InsightRefineDialogProps> = ({
  isOpen,
  onClose,
  insightTitle,
  insightContent,
  onRefine
}) => {
  const [refinedContent, setRefinedContent] = useState(insightContent);
  const [isRefining, setIsRefining] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [aiConversationMode, setAIConversationMode] = useState(false);

  const handleRefine = () => {
    setIsRefining(true);
    
    // Call the onRefine callback with the updated content
    onRefine(refinedContent);
    
    // Close the dialog and reset state
    setTimeout(() => {
      setIsRefining(false);
      onClose();
    }, 500);
  };

  const startAIConversation = () => {
    setAIConversationMode(true);
    setIsLoadingAI(true);
    
    // Initial AI message to start the conversation
    const initialAIMessage = {
      role: 'ai' as const,
      content: `I'll help you refine the insight about "${insightTitle}". What specific aspects would you like to improve? For example:
      - Make it more actionable
      - Provide more specific data points
      - Focus on a particular audience segment
      - Reframe for executive presentation`
    };
    
    // Simulate AI response delay
    setTimeout(() => {
      setMessages([initialAIMessage]);
      setIsLoadingAI(false);
    }, 1000);
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: currentMessage };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoadingAI(true);
    
    // Simulate AI response
    setTimeout(() => {
      // Generate appropriate AI response based on conversation context
      let aiResponse = "";
      
      // Check if this is the first user message
      if (messages.length === 1) {
        aiResponse = `Based on your request, here's a refined version of the insight:\n\n${refinedContent}\n\nI've enhanced it to be more actionable and specific. Would you like me to make any further adjustments?`;
      } else {
        // For subsequent messages, provide more targeted refinements
        aiResponse = `I've further refined the insight based on your feedback. Here's the updated version:\n\n${refinedContent}\n\nDoes this better address your needs? I can continue to refine it if needed.`;
      }
      
      // Update the refined content with the AI suggestion
      const newRefinedContent = generateRefinedContent(currentMessage, refinedContent);
      setRefinedContent(newRefinedContent);
      
      // Add AI response to messages
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setIsLoadingAI(false);
    }, 1500);
  };

  // Helper function to generate refined content based on user request
  const generateRefinedContent = (userRequest: string, currentContent: string): string => {
    // In a real implementation, this would call the Claude API
    // For now, we'll simulate some basic refinements
    
    const lowerRequest = userRequest.toLowerCase();
    
    if (lowerRequest.includes("actionable")) {
      return currentContent + "\n\nRecommended Actions:\n1. Conduct a focused audience survey to validate these insights\n2. Develop a prototype based on these findings\n3. Schedule a workshop with stakeholders to prioritize implementation";
    } else if (lowerRequest.includes("specific") || lowerRequest.includes("data")) {
      return currentContent.replace(/([0-9]+)%/g, (match) => {
        // Replace percentages with more specific ones
        const num = parseInt(match);
        return `${num + 3}% based on Q1 2023 data`;
      });
    } else if (lowerRequest.includes("executive") || lowerRequest.includes("presentation")) {
      // Make it more executive-friendly
      return "Executive Summary: " + currentContent.split('.').slice(0, 2).join('.') + ".\n\nKey Business Impact: " + 
        currentContent.split('.').slice(2, 4).join('.');
    } else {
      // Generic improvement - add strategic framing
      return "Strategic Insight: " + currentContent + "\n\nThis presents a significant opportunity for differentiation in the market.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Refine Insight with AI Assistance</DialogTitle>
          <DialogDescription>
            {!aiConversationMode 
              ? "Choose how you'd like to refine this insight" 
              : "Have a conversation with AI to refine your insight"}
          </DialogDescription>
        </DialogHeader>
        
        {!aiConversationMode ? (
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Insight Title</h4>
              <div className="bg-slate-50 p-2 rounded text-sm">{insightTitle}</div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Insight Content</h4>
              <Textarea
                value={refinedContent}
                onChange={(e) => setRefinedContent(e.target.value)}
                className="min-h-[200px]"
                placeholder="Edit the insight content..."
              />
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={startAIConversation}
                className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <MessageSquare size={16} />
                Get AI guidance instead
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden space-y-4 py-4">
            <div className="flex-1 overflow-y-auto pr-2">
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
                    sendMessage();
                  }
                }}
                disabled={isLoadingAI}
              />
              <Button 
                size="icon" 
                onClick={sendMessage} 
                disabled={!currentMessage.trim() || isLoadingAI}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRefining}>
            Cancel
          </Button>
          <Button 
            onClick={handleRefine} 
            disabled={isRefining}
            className="gap-2"
          >
            {isRefining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refining...
              </>
            ) : (
              "Apply Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsightRefineDialog;
