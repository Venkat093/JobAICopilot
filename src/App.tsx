import { useEffect } from 'react';
import InterviewCopilot from './components/InterviewCopilot';

import LiveTranscriber from './components/Test';
import './App.css';

function App() {
  useEffect(() => {
    // Apply dark theme to the document
    document.documentElement.classList.add('dark');
  }, []);

  // return <InterviewCopilot />;
  return <div>
    <LiveTranscriber/>
  </div>
}

export default App;