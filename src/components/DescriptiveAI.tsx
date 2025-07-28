import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DescriptiveAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    const processInput = async () => {
      if (!listening && transcript) {
        await handleSpeechInput(transcript); // Await here
        resetTranscript();
      }
    };
    processInput();
  }, [listening, transcript]);


  // const handleSpeechInput = async (input: string) => {
  //   if (!input.trim()) return;

  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     role: 'user',
  //     content: input,
  //     timestamp: new Date()
  //   };

  //   setMessages(prev => [...prev, userMessage]);
  //   setIsProcessing(true);

  //   // Simulate AI response
  //   setTimeout(() => {
  //     const aiResponse: Message = {
  //       id: (Date.now() + 1).toString(),
  //       role: 'assistant',
  //       content: `I understand you're asking about: "${input}". This is a comprehensive response that would typically come from an AI system designed to help with interview preparation. The system would analyze your question and provide detailed, contextual answers to help you prepare for technical interviews, behavioral questions, and general interview strategies.`,
  //       timestamp: new Date()
  //     };
  //     setMessages(prev => [...prev, aiResponse]);
  //     setIsProcessing(false);
  //   }, 1500);
  // };

  const handleSpeechInput = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    const assistantMessageId = (Date.now() + 1).toString();
    let assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: result }
              : msg
          )
        );
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'An error occurred while generating a response.' }
            : msg
        )
      );
    } finally {
      console.log("fver");
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="w-full">
        <Card className="bg-card border-border flex items-center justify-center p-8">
          <p className="text-muted-foreground">Browser doesn't support speech recognition.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Descriptive AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click the microphone to start asking questions!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {message.content.split(/(?:^|\n)(?=\d+\.\s)/).map((line, index) => (
                        <p key={index} className="text-sm mb-2">{line.trim()}</p>
                      ))}


                      <p className="text-xs opacity-70 mt-1">
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
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Voice Input Controls */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border">
            <Button
              onClick={listening ? stopListening : startListening}
              variant={listening ? "destructive" : "default"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
            >
              {listening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium">
                {listening ? 'Listening...' : 'Click to speak'}
              </p>
              {transcript && (
                <p className="text-xs text-muted-foreground mt-1">
                  "{transcript}"
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DescriptiveAI;