// InterviewCopilot.tsx
import React from "react";
import Profile from "./Profile";
import Resume from "./Resume";
import DescriptiveAI from "./DescriptiveAI";
import CodeAI from "./CodeAI";

const InterviewCopilot: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Interview Copilot</h1>
      </header>

      {/* Body locked to remaining viewport height */}
      <main className="flex-1 overflow-hidden p-4">
        {/* Outer grid: 30% left column | 70% right column */}
        <div
          className="grid h-full w-full gap-4"
          style={{ gridTemplateColumns: "30% 70%" }}
        >
          {/* LEFT column: Profile (30% height) over Resume (70% height) */}
          <section className="min-w-0 min-h-0 overflow-hidden">
            <div
              className="grid h-full w-full gap-4"
              style={{ gridTemplateRows: "30% 70%" }}
            >
              {/* Profile 30% height */}
              <div className="min-h-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <Profile />
                </div>
              </div>

              {/* Resume 70% height */}
              <div className="min-h-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <Resume />
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT column: DescriptiveAI (70% height) over CodeAI (30% height) */}
          <section className="min-w-0 min-h-0 overflow-hidden">
            <div
              className="grid h-full w-full gap-4"
              style={{ gridTemplateRows: "70% 30%" }}
            >
              {/* DescriptiveAI 70% height (top-right) */}
              <div className="min-h-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <DescriptiveAI />
                </div>
              </div>

              {/* CodeAI 30% height (bottom-right) */}
              <div className="min-h-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <CodeAI />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default InterviewCopilot;
