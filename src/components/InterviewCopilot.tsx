import React from 'react';
import Profile from './Profile';
import Resume from './Resume';
import DescriptiveAI from './DescriptiveAI';
import CodeAI from './CodeAI';

const InterviewCopilot: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="h-16 flex items-center justify-center border-b border-border bg-card flex-shrink-0">
        <h1 className="text-xl font-bold text-primary">www.interviewcopilot.com</h1>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4 p-4">
        {/* Left Column */}
        <div className="grid grid-rows-1 lg:grid-rows-[40%_60%] gap-4 lg:border-r lg:border-border lg:pr-4">
          <div className="min-h-[400px]">
            <Profile />
          </div>
          <div className="min-h-[500px]">
            <Resume />
          </div>
        </div>

        {/* Right Column */}
        <div className="grid grid-rows-1 lg:grid-rows-[60%_40%] gap-4">
          <div className="min-h-[500px]">
            <DescriptiveAI />
          </div>
          <div className="min-h-[400px]">
            <CodeAI />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCopilot;