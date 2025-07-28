import { useEffect } from 'react';
import InterviewCopilot from './components/InterviewCopilot';
import './App.css';

function App() {
  useEffect(() => {
    // Apply dark theme to the document
    document.documentElement.classList.add('dark');
  }, []);

  return <InterviewCopilot />;
}

export default App;