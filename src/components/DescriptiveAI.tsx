import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, MessageSquare } from "lucide-react";

// ---------- Chat Message Interface ----------
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ---------- Utility ----------
function pickMime() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const m of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch (err) {
      console.error("[pickMime] Error checking mime type:", err);
    }
  }
  return "";
}

// ---------- Component ----------
const DescriptiveAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // ✅ Hardcoded prompt (instead of showing input)
  const PROMPT = "Answer this Java question";

  // Streams / recorder refs
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioOnlyStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chosenMimeRef = useRef("");

  // Append message helper
  const appendMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  // ---------- Start Capture ----------
  const startCapture = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        selfBrowserSurface: "exclude",
        systemAudio: "exclude",
      });

      const audioTracks = displayStream.getAudioTracks();
      if (!audioTracks.length)
        throw new Error(
          "No audio track. Make sure 'Share tab audio' is checked."
        );

      const audioOnlyStream = new MediaStream(audioTracks);
      displayStream.getVideoTracks().forEach((t) => t.stop());

      displayStreamRef.current = displayStream;
      audioOnlyStreamRef.current = audioOnlyStream;

      const mime = pickMime() || "audio/webm;codecs=opus";
      chosenMimeRef.current = mime;
      const opts = mime
        ? { mimeType: mime, audioBitsPerSecond: 128000 }
        : undefined;

      const mr = new MediaRecorder(audioOnlyStream, opts);
      recorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mime || "audio/webm",
        });
        chunksRef.current = [];
        if (blob.size) {
          await sendOnce(blob, PROMPT); // ✅ always use hardcoded prompt
        } else {
          appendMessage("assistant", "[WARN] Empty recording; nothing to send");
        }
      };

      mr.start();
      setIsCapturing(true);
      appendMessage("assistant", "[Started capturing tab audio]");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("[startCapture] Error:", err);
      appendMessage("assistant", `[ERROR] ${err?.message || err}`);
    }
  };

  // ---------- Stop Capture ----------
  const stopCapture = () => {
    if (!isCapturing) return;
    try {
      setIsCapturing(false);

      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch (err) {
          console.error("[stopCapture] Error stopping recorder:", err);
        }
      }
      recorderRef.current = null;

      if (audioOnlyStreamRef.current) {
        audioOnlyStreamRef.current.getTracks().forEach((t) => t.stop());
        audioOnlyStreamRef.current = null;
      }
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach((t) => t.stop());
        displayStreamRef.current = null;
      }

      appendMessage("assistant", "[Stopped capture]");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("[stopCapture] Error:", err);
      appendMessage("assistant", `[ERROR] ${err?.message || err}`);
    }
  };

  // ---------- Upload + Get Answer ----------
  const sendOnce = async (blob: Blob, userPrompt: string) => {
    try {
      setIsProcessing(true);
      appendMessage("user", `🎤 Sent audio with prompt: "${userPrompt}"`);

      const forcedType = /^audio\//.test(blob.type)
        ? blob.type
        : chosenMimeRef.current || "audio/webm";
      const file = new File([blob], `session_${Date.now()}.webm`, {
        type: forcedType,
      });

      const form = new FormData();
      form.append("audio", file, file.name);
      form.append("prompt", userPrompt || "");

      const resp = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const msg = await resp.text();
        appendMessage("assistant", `[Server error] ${msg}`);
        return;
      }

      const data = await resp.json();
      const transcript = (data?.transcript || "").trim();
      const answer = (data?.answer || "").trim();

      if (transcript)
        appendMessage("assistant", `📜 Transcript: ${transcript}`);
      if (answer) appendMessage("assistant", `🤖 Answer: ${answer}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("[sendOnce] Network or server error:", err);
      appendMessage("assistant", `[Network error] ${err?.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unload
  useEffect(() => {
    const onUnload = () => {
      try {
        stopCapture();
      } catch (err) {
        console.error("[useEffect] Error during unload cleanup:", err);
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  return (
    <div className="w-full">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Descriptive AI Assistant (Tab Audio)</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click start to capture tab audio and ask!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm mb-1">{message.content}</p>
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

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border">
            <Button
              onClick={isCapturing ? stopCapture : startCapture}
              variant={isCapturing ? "destructive" : "default"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
            >
              {isCapturing ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isCapturing
                  ? "Capturing tab audio..."
                  : "Click to capture tab audio"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DescriptiveAI;
