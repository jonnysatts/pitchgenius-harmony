
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, MessageSquare, Brain } from "lucide-react";
import { StrategicInsight } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
      content: `As Games Age's strategic gaming consultant, I've analyzed this insight for the "${section}" section. This opportunity for gaming-based customer education aligns with our core principle of Authentic Integration. How would you like to refine this insight to better position Fortress as the ideal partner for this activation?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'context'>('chat');

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
        const aiResponse = simulateGamesAgeResponse(inputValue, insight, section);
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
  const simulateGamesAgeResponse = (userInput: string, currentInsight: StrategicInsight, sectionName: string) => {
    const userInputLower = userInput.toLowerCase();
    
    // Check if user input contains ISP or education-related terms
    if (userInputLower.includes("isp") || userInputLower.includes("education")) {
      return {
        message: `Looking at this insight through our Games Age strategic lens, here's how we can refine it for the ${sectionName} section:

The gaming-based customer education approach is perfect for ISPs with complex service offerings. We can leverage Fortress's expertise to create an interactive onboarding experience that gamifies the process of learning about different service tiers and optimal usage scenarios.

Based on our experience with similar telecom clients, we've seen a 37% increase in product adoption when educational content is delivered through interactive gaming formats rather than traditional documentation. This approach would align with our Physical-Digital Fusion principle by combining in-venue demonstrations at Fortress with an ongoing digital companion app.

Would you like me to update this insight with specific Fortress activation opportunities for an ISP client?`,
        updatedContent: {
          ...currentInsight.content,
          summary: "Interactive gaming experiences can transform ISP customer education, increasing product adoption and reducing support costs.",
          details: `${currentInsight.content.details || ""}\n\nSpecifically for ISPs, gamified tutorials can address common pain points in service understanding and self-troubleshooting. Games Age research shows a 37% increase in feature adoption and a 24% reduction in support tickets when educational content is delivered through interactive gaming experiences versus traditional documentation.\n\nThis represents an opportunity to create a Fortress-powered gamified learning experience that bridges physical venue demonstrations with an ongoing digital companion app.`
        }
      };
    }
    
    // If the user wants to refine or update the insight
    if (userInputLower.includes("refine") || userInputLower.includes("update") || userInputLower.includes("change")) {
      return {
        message: `I've enhanced this insight based on Games Age's strategic framework and our expertise in the gaming industry.

For the ${sectionName} section, I've refined the content to emphasize our Community-First principle. The revised insight now includes specific metrics on engagement lift (42%) when customer education incorporates social gaming elements.

Additionally, I've added Fortress-specific activation recommendations including an in-venue educational gaming zone concept that has proven successful with similar technology clients.

The insight now better positions Fortress as the ideal execution partner with our unique ability to bridge physical and digital educational experiences.`,
        updatedContent: {
          ...currentInsight.content,
          summary: `Gaming-based customer education can transform product utilization rates by creating engaging, interactive learning experiences.`,
          details: `${currentInsight.content.details || ""}\n\nBy incorporating game mechanics like achievement systems and progression paths into customer education, brands can increase feature adoption by 42% and extend customer time-in-product by nearly 3x (Games Age proprietary research, 2023).\n\nFortress offers a unique activation opportunity through its ability to host immersive educational gaming experiences where customers can learn through play while connecting with peers and experts.`
        }
      };
    }
    
    // If the user wants more details
    if (userInputLower.includes("more detail") || userInputLower.includes("elaborate")) {
      return {
        message: `From our Games Age strategic perspective, here's the expanded context for this insight:

Gaming-based education represents a significant opportunity for brands with complex products because it leverages intrinsic motivation rather than extrinsic pressure. Our research across technology verticals shows that education disguised as entertainment produces 3.4x longer engagement times and 28% higher information retention.

For the ${currentInsight.category} category specifically, we've executed similar initiatives with companies like NordVPN and Cisco, creating gamified educational experiences that resulted in:
• 42% increase in feature adoption
• 67% reduction in support tickets for common issues
• 28% lift in customer satisfaction metrics

Fortress can provide a unique activation path through our ability to host immersive educational gaming tournaments where customers compete to demonstrate product mastery, creating both educational value and community connection.

Would you like me to update the insight with these specific data points and the Fortress activation strategy?`,
        updatedContent: null
      };
    }
    
    // Default response that's contextually relevant to Games Age
    return {
      message: `As Games Age's strategic gaming consultant, I can help refine this insight for the ${sectionName} section to better showcase the gaming-based customer education opportunity.

Looking at this through our expertise lens, I see several ways to strengthen this insight:

1) We could add industry benchmarks from our similar activations showing engagement lift (typically 30-45%)
2) We could incorporate a specific Fortress activation strategy like our "Learn & Play" program
3) We could connect this to our Physical-Digital Fusion principle with a recommendation for an in-venue component supported by a mobile companion

Which direction would be most valuable for your presentation?`,
      updatedContent: null
    };
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Refine Insight with Games Age AI
        </CardTitle>
        <CardDescription>
          Discuss and enhance this insight with our gaming industry expertise for the {section} section
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'context')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="context" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Strategic Context
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
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
                placeholder="Ask about this insight or suggest gaming-focused refinements..."
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
          </TabsContent>
          
          <TabsContent value="context">
            <div className="bg-muted p-4 rounded-lg space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Games Age Strategic Framework</h3>
                <ul className="list-disc list-inside text-sm mt-2 space-y-2">
                  <li><span className="font-medium">Authentic Integration</span> – Add value to gaming experiences rather than disrupt them</li>
                  <li><span className="font-medium">Physical-Digital Fusion</span> – Bridge real-world activations with digital ecosystems</li>
                  <li><span className="font-medium">Community-First Thinking</span> – Build long-term brand affinity through relationship-driven approaches</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold">Our Strategic Approach</h3>
                <ul className="list-disc list-inside text-sm mt-2 space-y-2">
                  <li><span className="font-medium">Revenue impact & business viability</span> – All strategies must drive measurable growth</li>
                  <li><span className="font-medium">Cultural alignment</span> – Recommendations must align with gaming behaviors and psychology</li>
                  <li><span className="font-medium">Competitive differentiation</span> – Position clients as unique and innovative in gaming</li>
                  <li><span className="font-medium">Long-term engagement</span> – Build sustainable brand equity in gaming</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold">Fortress Capabilities</h3>
                <p className="text-sm mt-2">
                  The largest gaming and esports venue in the Southern Hemisphere, offering state-of-the-art gaming lounges, 
                  esports arenas, and immersive brand experiences. Games Age is the strategic consulting arm providing insights 
                  on authentic integration into gaming culture.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
