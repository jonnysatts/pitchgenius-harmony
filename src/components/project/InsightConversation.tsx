
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, MessageSquare } from "lucide-react";
import { StrategicInsight } from "@/lib/types";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface InsightConversationProps {
  insight: StrategicInsight;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  onClose: () => void;
  section: string;
}

const InsightConversation: React.FC<InsightConversationProps> = ({
  insight,
  onUpdateInsight,
  onClose,
  section
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `ai-${Date.now()}`,
      content: `I've analyzed this insight for the "${section}" section. What would you like to discuss or refine about it?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // This would normally call an API to get the AI response
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiResponse = simulateAIResponse(inputValue, insight, section);
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          content: aiResponse.message,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // If the AI suggested an update
        if (aiResponse.updatedContent) {
          onUpdateInsight(insight.id, aiResponse.updatedContent);
        }
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsLoading(false);
    }
  };

  // This will be replaced with actual AI API calls
  const simulateAIResponse = (userInput: string, currentInsight: StrategicInsight, sectionName: string) => {
    const userInputLower = userInput.toLowerCase();
    
    // Check if the user wants to refine or update the insight
    if (userInputLower.includes("refine") || userInputLower.includes("update") || userInputLower.includes("change")) {
      return {
        message: `I've refined the insight based on your feedback. I've adjusted the content to be more specific and actionable for the ${sectionName} section.`,
        updatedContent: {
          ...currentInsight.content,
          summary: currentInsight.content.summary + " (Refined based on user feedback)",
          details: `${currentInsight.content.details}\n\nAdditional context: This has been refined to better address specific ${sectionName} needs.`
        }
      };
    }
    
    // If the user wants more details
    if (userInputLower.includes("more detail") || userInputLower.includes("elaborate")) {
      return {
        message: `Here's some additional context for this insight: This approach has been successful in similar ${currentInsight.category} initiatives, particularly when targeting audiences interested in immersive gaming experiences. Would you like me to update the insight with this additional context?`,
        updatedContent: null
      };
    }
    
    // Default response
    return {
      message: `I understand you're interested in discussing this insight for the ${sectionName} section. Could you be more specific about what aspect you'd like to refine? For example, you might want to make it more industry-specific, add supporting data, or adjust the strategic direction.`,
      updatedContent: null
    };
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Refine Insight with AI
        </CardTitle>
        <CardDescription>
          Discuss and refine this insight for the {section} section
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="bg-muted p-4 rounded-lg mb-4">
          <h3 className="font-semibold">{insight.content.title || "Insight"}</h3>
          <p className="text-sm text-muted-foreground mt-1">{insight.content.summary}</p>
          {insight.content.details && (
            <p className="text-xs mt-2 text-muted-foreground">{insight.content.details.substring(0, 150)}...</p>
          )}
        </div>
        
        <div className="space-y-4 max-h-80 overflow-y-auto p-2 mb-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-muted text-foreground">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this insight or suggest changes..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <p className="text-xs text-muted-foreground">
          Powered by Games Age Strategic AI
        </p>
      </CardFooter>
    </Card>
  );
};

export default InsightConversation;
