import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Upload } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CodeAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);


  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1]; // Strip data:image/... prefix

      // Add user message to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: file.name,
          timestamp: new Date()
        },
        {
          id: 'streaming',
          role: 'assistant',
          content: '',
          timestamp: new Date()
        }
      ]);

      try {
        const response = await fetch('http://localhost:3000/api/generate_image_to_text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Data }),
        });

        if (!response.ok || !response.body) {
          throw new Error('Failed to get response stream');
        }

        const streamReader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';

        while (true) {
          const { done, value } = await streamReader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update streaming assistant message in real time
          setMessages(prev =>
            prev.map(msg =>
              msg.id === 'streaming' ? { ...msg, content: accumulated } : msg
            )
          );
        }

        // Replace the 'streaming' message with finalized one
        setMessages(prev =>
          prev.map(msg =>
            msg.id === 'streaming'
              ? {
                ...msg,
                id: Date.now().toString(),
                timestamp: new Date(),
              }
              : msg
          )
        );
      } catch (error) {
        console.error('Streaming error:', error);
        setMessages(prev => [
          ...prev.filter(m => m.id !== 'streaming'),
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: '❌ Failed to generate code from image.',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file); // Trigger file read
  };





  return (
    <div className="w-full">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Code AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a coding screenshot or document to get started!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg p-3 ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {message.role === 'assistant' ? (
                        <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                          <code>{message.content}</code>
                        </pre>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Generating code...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Upload Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="relative h-10 px-6 text-sm"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                    e.target.value = ''; // Allow re-upload of the same file
                  }
                }}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

};

export default CodeAI;