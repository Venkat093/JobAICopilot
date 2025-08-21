// InterviewCopilot.tsx
import React, { useMemo, useState } from "react";
import Profile from "./Profile";
import Resume from "./Resume";
import DescriptiveAI from "./DescriptiveAI";
import CodeAI from "./CodeAI";

type ViewMode = "expanded" | "collapsed";

const InterviewCopilot: React.FC = () => {
  // Start collapsed by default
  const [viewMode, setViewMode] = useState<ViewMode>("collapsed");

  // RIGHT column rows: collapsed = Descriptive 100% / Code 0%; expanded = 30% / 70%
  const rightColumnRows = useMemo(() => {
    return viewMode === "expanded" ? "30% 70%" : "100% 0%";
  }, [viewMode]);

  const toggleLabel = viewMode === "expanded" ? "Collapse Code" : "Show Code";

  const onToggle = () => {
    setViewMode((m) => (m === "collapsed" ? "expanded" : "collapsed"));
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Interview Copilot</h1>
      </header>

      {/* Body locked to remaining viewport height */}
      <main className="flex-1 overflow-hidden p-4">
        {/* Outer grid: 30% left column | 70% right column */}
        <div className="grid h-full w-full gap-4" style={{ gridTemplateColumns: "30% 70%" }}>
          {/* LEFT column: Profile (30%) over Resume (70%) */}
          <section className="min-w-0 min-h-0 overflow-hidden">
            <div className="grid h-full w-full gap-4" style={{ gridTemplateRows: "30% 65%" }}>
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

          {/* RIGHT column: DescriptiveAI over CodeAI with dynamic heights */}
          <section className="relative min-w-0 min-h-0 overflow-hidden">
            <div
              className="grid h-full w-full gap-4 transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: rightColumnRows }}
            >
              {/* DescriptiveAI (top-right) */}
              <div className="min-h-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <DescriptiveAI />
                </div>
              </div>

              {/* CodeAI (bottom-right) */}
              <div
                className="min-h-0 overflow-hidden"
                style={{
                  display: viewMode === "collapsed" ? "none" : undefined,
                }}
              >
                <div className="h-full overflow-auto">
                  <CodeAI />
                </div>
              </div>
            </div>

            {/* Bottom-right toggle button - always visible in the right column */}
            <div className="pointer-events-none absolute bottom-3 right-3">
              <button
                type="button"
                onClick={onToggle}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm hover:bg-accent transition-colors"
                title={viewMode === "collapsed" ? "Expand CodeAI to 70%" : "Collapse CodeAI (hide)"}
                aria-pressed={viewMode === "expanded"}
                aria-label={viewMode === "collapsed" ? "Show CodeAI panel" : "Collapse CodeAI panel"}
              >
                {toggleLabel}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default InterviewCopilot;
