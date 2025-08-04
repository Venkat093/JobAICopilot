import React, { useState, useRef, useEffect } from 'react';

export default function LiveTranscriber() {
  const [transcript, setTranscript] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Connect to WebSocket server
  const connectSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8080'); // Adjust to your backend
    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };
    socketRef.current.onmessage = (message) => {
      const { text } = JSON.parse(message.data);
      console.log(text)
      setTranscript((prev) => prev + ' ' + text);
    };
    socketRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  };

  useEffect(()=>{
 console.log(isCapturing);
 console.log(transcript);
  },[isCapturing,transcript])

  const startCapturing = async () => {
    connectSocket();

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    if (!stream.getAudioTracks().length) {
      alert('No audio found in selected tab.');
      return;
    }

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(e.data);
      }
    };

    mediaRecorderRef.current.start(500); // send audio every 500ms
    setIsCapturing(true);
  };

  const stopCapturing = () => {
    mediaRecorderRef.current?.stop();
    socketRef.current?.close();
    setIsCapturing(false);
  };

  useEffect(() => {
    return () => {
      stopCapturing();
    };
  }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Live Transcription from Selected Tab</h2>
      <button onClick={isCapturing ? stopCapturing : startCapturing}>
        {isCapturing ? 'Stop Transcription' : 'Start Transcription'}
      </button>

      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', whiteSpace: 'pre-wrap' }}>
        <strong>Transcript:</strong>
        <p>{transcript || '...Waiting for speech'}</p>
      </div>
    </div>
  );
}