import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import options from './editorOptions';
import './App.css';

function App() {
  const editorRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [code, setCode] = useState('');
  const [outputs, setOutputs] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'vs');
  const [isFullscreen, setIsFullscreen] = useState(false);

  React.useEffect(() => {
    const storedCode = localStorage.getItem('code');
    if (storedCode) {
      setCode(storedCode);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('code', code);
  }, [code]);

  React.useEffect(() => {
    document.body.classList.toggle('dark-mode', theme === 'vs-dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const runCode = () => {
    try {
      const worker = new Worker('worker.js');
      worker.onmessage = (event) => {
        setOutputs((prevOutputs) => [...prevOutputs, event.data]);
      };
      worker.postMessage(code);
    } catch (error) {
      console.error('Error:', error);
      setOutputs((prevOutputs) => [...prevOutputs, error.toString()]);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'vs' ? 'vs-dark' : 'vs'));
  };

  const clearOutput = () => {
    setOutputs([]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit full-screen mode:', err);
      });
    }
  };

  const renderOutput = (output, index) => {
    if (typeof output === 'string') {
      return <div key={index}>{output}</div>;
    } else if (typeof output === 'object' && output !== null) {
      return <div>{JSON.stringify(output, 4, null)}</div>;
    } else {
      return <div key={index}>{output}</div>;
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  return (
    <div className="container">
      <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="editor-container-header">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme !== 'vs-dark' ? '🌙 Dark Mode' : '🌞 Light Mode'}
          </button>
        </div>
        <div className="editor-border" ref={containerRef}>
          <Editor
            className="editor"
            width="100%"
            height="100vh"
            theme={theme}
            options={options}
            language="javascript"
            value={code}
            onMount={handleEditorDidMount}
            onChange={(newValue) => setCode(newValue)}
          />
        </div>
      </div>

      <div className="output-container">
        <div className="output-container-button">
          <button onClick={runCode}>Run</button>
          <button onClick={clearOutput}>Clear Output</button>
          <button onClick={toggleFullscreen}>
            {isFullscreen ? 'Exit Fullscreen' : 'Expand'}
          </button>
        </div>
        <div className="output">
          {outputs.map((output, index) => renderOutput(output, index))}
        </div>
      </div>
    </div>
  );
}

export default App;
