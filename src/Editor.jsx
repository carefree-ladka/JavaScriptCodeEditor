import React, { useState } from 'react';
import { Eraser, Expand, Maximize, Moon, Play, Sun } from 'lucide-react';
import Editor from '@monaco-editor/react';
import options from './editorOptions';
import './App.css';

function App() {
  const editorRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [code, setCode] = useState('console.log("Hello, Coder 💀");');
  const [outputs, setOutputs] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'vs');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState('javascript'); // Add language state

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
    if (language === 'javascript') {
      // JavaScript logic using Worker
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
    } else if (language === 'html') {
      // Display HTML code in an iframe
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setOutputs([<iframe key="iframe" src={url} style={{ width: '100%', height: '300px', border: 'none' }} />]);
    } else if (language === 'css') {
      // Apply CSS to a simple preview div
      setOutputs([<style key="style">{code}</style>, <div key="preview" className="css-preview">CSS Preview</div>]);
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

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  return (
    <div className="container">
      <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="editor-container-header">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme !== 'vs-dark' ? (<Moon />) : (<Sun />)}
          </button>
        </div>
        <div className="editor-border" ref={containerRef}>
          <Editor
            className="editor"
            width="100%"
            height="100vh"
            theme={theme}
            options={options}
            language={language} // Set editor language dynamically
            value={code}
            onMount={handleEditorDidMount}
            onChange={(newValue) => setCode(newValue)}
          />
        </div>
      </div>

      <div className="output-container">
        <div className="output-container-button">
          <button title='Run' onClick={runCode}><Play /></button>
          <button title='Clear' onClick={clearOutput}><Eraser /></button>
          <button title='Toggle Screen' onClick={toggleFullscreen}>
            {isFullscreen ? <Maximize /> : <Expand />}
          </button>
        </div>
        <div className="output">
          {outputs.map((output, index) => <div key={index}>{output}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;
