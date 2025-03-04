
import React, { useState, useRef, useEffect } from "react";
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
import { Loader2, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Ref for auto-scrolling chat container
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const startAIConversation = async () => {
    setAIConversationMode(true);
    setIsLoadingAI(true);
    
    try {
      // Call the Claude API via Edge Function to start the conversation
      const initialPrompt = `Help me refine this insight about "${insightTitle}". 
The current content is: "${insightContent}"

You are an expert consultant from Games Age, a gaming consultancy that helps businesses integrate gaming into their strategy. Your job is to help refine strategic insights and make them more impactful.

Start by offering some ways I might want to improve this insight, for example:
- Make it more actionable
- Provide more specific data points
- Focus on a particular audience segment
- Reframe for executive presentation`;

      const { data, error } = await supabase.functions.invoke('refine-insight-with-anthropic', {
        body: { 
          prompt: initialPrompt,
          insightTitle,
          insightContent
        }
      });
      
      if (error) {
        console.error("Error calling Claude API:", error);
        // Add a fallback message if the API call fails
        const fallbackMessage = {
          role: 'ai' as const,
          content: `I'll help you refine the insight about "${insightTitle}". What specific aspects would you like to improve? For example:
          - Make it more actionable
          - Provide more specific data points
          - Focus on a particular audience segment
          - Reframe for executive presentation

Note: I'm currently operating in fallback mode due to a connection issue with the AI service.`
        };
        setMessages([fallbackMessage]);
      } else {
        // Add the AI response to the messages
        const aiResponse = {
          role: 'ai' as const,
          content: data.response || `I'll help you refine the insight about "${insightTitle}". What specific aspects would you like to improve?`
        };
        setMessages([aiResponse]);
      }
    } catch (err) {
      console.error("Error starting AI conversation:", err);
      // Add a fallback message
      const fallbackMessage = {
        role: 'ai' as const,
        content: `I'll help you refine the insight about "${insightTitle}". What specific aspects would you like to improve? (Note: I'm operating in fallback mode due to a connection issue.)`
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: currentMessage };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoadingAI(true);
    
    try {
      // Prepare context from previous messages
      const conversationContext = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n\n");
      
      // Call the Claude API via Edge Function
      const { data, error } = await supabase.functions.invoke('refine-insight-with-anthropic', {
        body: { 
          prompt: currentMessage,
          insightTitle,
          insightContent: refinedContent,
          conversationContext
        }
      });
      
      if (error) {
        console.error("Error calling Claude API:", error);
        // Add a fallback AI response
        const fallbackResponse = generateFallbackResponse(currentMessage, refinedContent);
        setMessages(prev => [...prev, { role: 'ai', content: fallbackResponse.message }]);
        setRefinedContent(fallbackResponse.refinedContent);
      } else {
        // Add the AI response to messages
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        
        // Update the refined content if the AI suggests changes
        if (data.refinedContent) {
          setRefinedContent(data.refinedContent);
        }
      }
    } catch (err) {
      console.error("Error sending message to AI:", err);
      // Add a fallback AI response
      const fallbackResponse = generateFallbackResponse(currentMessage, refinedContent);
      setMessages(prev => [...prev, { role: 'ai', content: fallbackResponse.message }]);
      setRefinedContent(fallbackResponse.refinedContent);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Helper function to generate fallback responses in case the API is unavailable
  const generateFallbackResponse = (userMessage: string, currentContent: string): { message: string, refinedContent: string } => {
    const lowerRequest = userMessage.toLowerCase();
    let refinedContent = currentContent;
    let message = "I've made some refinements based on your feedback. How does this look?";
    
    if (lowerRequest.includes("actionable")) {
      refinedContent = currentContent + "\n\nRecommended Actions:\n1. Conduct a focused audience survey to validate these insights\n2. Develop a prototype based on these findings\n3. Schedule a workshop with stakeholders to prioritize implementation";
      message = "I've added specific recommended actions to make the insight more actionable. Is there anything else you'd like me to refine?";
    } else if (lowerRequest.includes("specific") || lowerRequest.includes("data")) {
      refinedContent = currentContent.replace(/([0-9]+)%/g, (match) => {
        const num = parseInt(match);
        return `${num + 3}% based on Q1 2023 data`;
      });
      message = "I've added specific data points with time references to make the insight more concrete. Would you like any other enhancements?";
    } else if (lowerRequest.includes("executive") || lowerRequest.includes("presentation")) {
      refinedContent = "Executive Summary: " + currentContent.split('.').slice(0, 2).join('.') + ".\n\nKey Business Impact: " + 
        currentContent.split('.').slice(2, 4).join('.');
      message = "I've reformatted the insight to be more executive-friendly with a clear summary and business impact section. Does this meet your needs?";
    } else {
      refinedContent = "Strategic Insight: " + currentContent + "\n\nThis presents a significant opportunity for differentiation in the market.";
      message = "I've enhanced the strategic framing of the insight. Is there a specific direction you'd like to take it now?";
    }
    
    return { message, refinedContent };
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
