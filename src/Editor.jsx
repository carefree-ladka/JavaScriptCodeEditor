// App.jsx
import React, { useState } from 'react';
import { Eraser, Expand, Maximize, Moon, Play, Sun } from 'lucide-react';
import Editor from '@monaco-editor/react';
// import themes from 'monaco-themes/themes/themelist.json';
import options from './editorOptions';
import './App.css';

function App() {
  const editorRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [code, setCode] = useState('console.log("Hello, Coder 💀");');
  const [outputs, setOutputs] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'vs');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState('javascript');
  // const [availableThemes, setAvailableThemes] = useState([]);

  // React.useEffect(() => {
  //   const loadThemes = async () => {
  //     const themeArray = Object.entries(themes).map(([id, name]) => ({ id, name }));
  //     setAvailableThemes(themeArray);

  //     // Load all themes
  //     for (const [id, name] of Object.entries(themes)) {
  //       try {
  //         const themeData = await fetch(`https://raw.githubusercontent.com/brijeshb42/monaco-themes/master/themes/${id}.json`).then(r => r.json());
  //         monaco.editor.defineTheme(id, themeData);
  //       } catch (error) {
  //         console.error(`Failed to load theme: ${name}`, error);
  //       }
  //     }
  //   };

  //   loadThemes();
  // }, []);

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
  }, [theme]);

  const runCode = () => {
    if (language === 'javascript') {
      try {
        const worker = new Worker('worker.js');
        worker.onmessage = (event) => {
          setOutputs((prevOutputs) => [...prevOutputs, event.data]);
        };
        worker.postMessage(code);
      } catch (error) {
        console.error('Error:', error);
        setOutputs((prevOutputs) => [...prevOutputs, {
          type: 'error',
          content: [error.toString()],
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } else if (language === 'html') {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setOutputs([<iframe key="iframe" src={url} style={{ width: '100%', height: '300px', border: 'none' }} />]);
    } else if (language === 'css') {
      setOutputs([<style key="style">{code}</style>, <div key="preview" className="css-preview">CSS Preview</div>]);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'vs' ? 'vs-dark' : 'vs';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // const handleThemeChange = (e) => {
  //   const newTheme = e.target.value;
  //   setTheme(newTheme);
  //   localStorage.setItem('theme', newTheme);
  // };

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

  // const setupAutocompletion = (editor, monaco) => {
  //   monaco.languages.registerCompletionItemProvider('javascript', {
  //     provideCompletionItems: (model, position) => {
  //       const word = model.getWordUntilPosition(position);
  //       const range = {
  //         startLineNumber: position.lineNumber,
  //         endLineNumber: position.lineNumber,
  //         startColumn: word.startColumn,
  //         endColumn: word.endColumn
  //       };

  //       const suggestions = [
  //         {
  //           label: 'console.log',
  //           kind: monaco.languages.CompletionItemKind.Function,
  //           insertText: 'console.log($1)',
  //           insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  //           range,
  //           detail: 'Log to console',
  //           documentation: 'Outputs a message to the console'
  //         },
  //         {
  //           label: 'console.error',
  //           kind: monaco.languages.CompletionItemKind.Function,
  //           insertText: 'console.error($1)',
  //           insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  //           range,
  //           detail: 'Error to console',
  //           documentation: 'Outputs an error message to the console'
  //         }
  //       ];

  //       return { suggestions };
  //     }
  //   });
  // };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    // setupAutocompletion(editor, monaco);
  };

  const formatOutput = (output, index) => {
    if (React.isValidElement(output)) {
      return output;
    }

    if (output.type === 'error') {
      return (
        <div key={index} className="console-error">
          <span className="console-timestamp">{output.timestamp}</span>
          <span className="console-content error">
            {output.content.join(' ')}
          </span>
        </div>
      );
    }

    return (
      <div key={index} className="console-log">
        <span className="console-content">
          {output.content.map((item, i) => (
            <span key={i} className={`console-item type-${typeof item}`}>
              {i > 0 ? ' ' : ''}{item}
            </span>
          ))}
        </span>
      </div>
    );
  };

  return (
    <div className="container">
      <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="editor-container-header">
          {/* <select
            className="theme-select"
            value={theme}
            onChange={handleThemeChange}
          >
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            {availableThemes.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select> */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'vs' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'vs' ? <Moon /> : <Sun />}
          </button>
        </div>
        <div className="editor-border" ref={containerRef}>
          <Editor
            className="editor"
            width="100%"
            height="100vh"
            theme={theme}
            options={options}
            language={language}
            value={code}
            onMount={handleEditorDidMount}
            onChange={(newValue) => setCode(newValue)}
            // beforeMount={(monaco) => {
            //   monaco.editor.defineTheme('custom-theme', {
            //     base: 'vs-dark',
            //     inherit: true,
            //     rules: [],
            //     colors: {}
            //   });
            // }}
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
          {outputs.map((output, index) => formatOutput(output, index))}
        </div>
      </div>
    </div>
  );
}

export default App;