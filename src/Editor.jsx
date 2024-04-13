import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { toPng } from 'html-to-image';
import options from './editorOptions'
import './App.css';


function App() {
  const editorRef = React.useRef(null);
  const containerRef = React.useRef(null);
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


  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const formatCode = () => {
    const unformattedCode = editorRef.current.getValue();
    const formattedCode = prettier.format(unformattedCode, {
      parser: 'babel',
      plugins: [parserBabel],
      semi: true,
      singleQuote: true,
    });
    editorRef.current.setValue(formattedCode);
  };

  const downloadImage = async () => {
    if (containerRef.current) {
      try {
        const dataUrl = await toPng(containerRef.current);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'snippet.png';
        document.querySelector('.editor').style.border= "none";
        link.click();
      } catch (error) {
        console.error('oops, something went wrong!', error);
      }
    }
  };

  console.log(code);
  return (
    <div className="container" >
      <div className="editor-container" >
        {/* <button onClick={formatCode}>Format Code</button> */}
        <div className='editor-container-button'>
          <button onClick={downloadImage} disabled={!code} style={{
            background: !code ? "#ddd" : '#007bff'
          }}>Snippet</button>
          <button onClick={toggleTheme}>{theme !== 'vs-dark' ? "Dark" : "Light"} Theme</button>
        </div>
        <div className='editor-border' ref={containerRef}>
          <Editor
            className='editor'
            width="100vh"
            height="70vh"
            // defaultValue={`//console.log('Hello Coder...')`}
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
