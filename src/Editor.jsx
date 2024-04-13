import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import options from './editorOptions'
import './App.css';


function App() {
  const [code, setCode] = useState('');
  const [outputs, setOutputs] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'vs');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load code from local storage when the component mounts
  React.useEffect(() => {
    const storedCode = localStorage.getItem('code');
    if (storedCode) {
      setCode(storedCode);
    }
  }, []);

  // Save code to local storage whenever it changes
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
      // Listen for messages from the worker
      worker.onmessage = (event) => {
        // Append the output from the worker to the outputs array
        setOutputs(prevOutputs => [...prevOutputs, event.data]);
      };

      // Send the code to the worker
      worker.postMessage(code);
    } catch (error) {
      // Handle any errors
      console.error('Error:', error);
      setOutputs(prevOutputs => [...prevOutputs, error.toString()]);
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
    // Check if the output is a string
    if (typeof output === 'string') {
      return <div key={index}>{output}</div>;
    }
    // Check if the output is a JavaScript object
    else if (typeof output === 'object' && output !== null) {
      // Stringify the object to display it properly
      return <div>{JSON.stringify(output, 4, null)}</div>
    }
    // If the output is neither a string nor an object, render it as is
    else {
      return <div key={index}>{output}</div>;
    }
  };

  return (
    <div className="container" >
      <div className="editor-container" >
        <button onClick={toggleTheme}>{theme !== 'vs-dark' ? "Dark" : "Light"} Theme</button>
        <div className='editor-border' >
          <Editor
            width="100%"
            height="70vh"
            defaultValue='haha'
            theme={theme}
            options={options}
            language="javascript"
            value={code}
            onChange={(newValue) => setCode(newValue)}
          />
        </div>
      </div>
      <div className="output-container">
        <div className='output-container-button'>
          <div>
            <button onClick={runCode}>Run</button>
          </div>
          <div className='clear'>
            <button onClick={clearOutput}>Clear Output</button>
          </div>
          <div>
            <button onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit Fullscreen' : 'Expand'}
            </button>
          </div>
        </div>
        <div className="output">
          {
            outputs.map((output, index) => renderOutput(output, index))
          }
        </div>
      </div>
    </div>
  );
}

export default App;
