import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText } from 'lucide-react';



const Resume: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setFileName(file.name);
  setSummary('');
  setLoading(true);

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await fetch('http://localhost:3000/api/generate_file_summary', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to get response stream');
    }

    const streamReader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let buffer = '';

    while (true) {
      const { done, value } = await streamReader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Only handle lines starting with "data:"
        if (!line.startsWith('data:')) continue;

        const data = line.replace(/^data:\s*/, '').trim();

        if (data === '[DONE]') {
          setLoading(false);
          return;
        }

        accumulated += data;
        setSummary(accumulated);
      }

      // Keep partial data only if the last line wasn't complete
      buffer = buffer.endsWith('\n') ? '' : lines[lines.length - 1];
    }
  } catch (error: any) {
    console.error('Streaming error:', error);
    setSummary('❌ Error processing file: ' + error.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="w-full">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Resume</span>
            </span>
            <Button variant="outline" size="sm" className="relative">
              <Upload className="h-4 w-4 mr-2" />
              Upload
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </Button>
          </CardTitle>
          {fileName && (
            <p className="text-sm text-muted-foreground">
              Uploaded: {fileName}
            </p>
          )}
        </CardHeader>
      <div className="min-h-[500px] h-full flex flex-col">
  <Card className="bg-card border-border overflow-hidden w-full h-full flex flex-col">
    <CardHeader className="pb-4 flex-shrink-0">{/* ... */}</CardHeader>
    <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
      <ScrollArea className="h-full max-h-full pr-4">
        {loading
          ? <p className="p-4">Processing resume...</p>
          : <p className="p-4 break-words whitespace-pre-line">{summary || "Upload a resume file to see summary here."}</p>
        }
      </ScrollArea>
    </CardContent>
  </Card>
</div>


      </Card>
    </div>
  );
};

export default Resume;
