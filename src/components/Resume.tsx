import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText } from 'lucide-react';

const Resume: React.FC = () => {
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [description] = useState<string>(
    `Professional Summary:
    
Experienced Software Engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable web applications and leading cross-functional teams.

Key Achievements:
• Led development of a customer portal that increased user engagement by 40%
• Implemented microservices architecture reducing system downtime by 60%
• Mentored 5 junior developers and established coding best practices
• Optimized database queries resulting in 50% faster page load times

Technical Expertise:
• Frontend: React, TypeScript, Next.js, Tailwind CSS
• Backend: Node.js, Python, Express.js, FastAPI
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jira, Figma

Experience:
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Architected and developed enterprise-level web applications
• Collaborated with product managers to define technical requirements
• Implemented CI/CD pipelines improving deployment efficiency by 70%

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web applications using React and Node.js
• Integrated third-party APIs and payment gateways
• Participated in agile development processes and code reviews

Education:
Bachelor of Science in Computer Science
University of Technology | 2015 - 2019

Certifications:
• AWS Certified Solutions Architect
• Google Cloud Professional Developer
• Certified Scrum Master (CSM)`
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Read file content for display
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(`File uploaded: ${file.name}\n\nContent preview:\n${content.substring(0, 500)}...`);
      };
      reader.readAsText(file);
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
                accept=".pdf,.docx,.doc"
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
        <CardContent>
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-4 text-sm leading-relaxed">
              {(fileContent || description).split('\n').map((line, index) => (
                <p key={index} className={line.trim() === '' ? 'h-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Resume;