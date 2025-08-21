import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText } from 'lucide-react';

const Resume: React.FC = () => {
  const [fileName, setFileName] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileContent, setFileContent] = useState<string>('');
  const [streamedResponse, setStreamedResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

 

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStreamedResponse('');
    setLoading(true);

    // Read file content as text
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setFileContent(`File uploaded: ${file.name}\n\nContent preview:\n${content.substring(0, 500)}...`);

      try {
        // Call backend API with resume text
        const response = await fetch('http://localhost:5000/api/process_resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: content })
        });

        if (!response.body) throw new Error('No response body from API');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            setStreamedResponse((prev) => prev + decoder.decode(value));
          }
        }
      } catch (err) {
        console.error(err);
        setStreamedResponse('Error processing resume.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
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
        <CardContent className="overflow-hidden">
          <ScrollArea className="h-80 pr-4  overflow-y-hidden">
            <div className="space-y-4 text-sm leading-relaxed">
              {loading && <p className="text-blue-500">Processing resume...</p>}
              {streamedResponse && (
                <>
                  <p className="font-semibold">AI Summary:</p>
                  {streamedResponse.split('\n').map((line, index) => (
                    <p key={`response-${index}`} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Resume;
