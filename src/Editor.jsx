import React, { useState, useEffect, useRef } from "react";
import {
  Eraser,
  Expand,
  Maximize,
  Moon,
  Play,
  Sun,
  Settings,
  Code,
  Terminal,
} from "lucide-react";
import Editor from "@monaco-editor/react";

// Enhanced Monaco Editor options for VS Code-like experience
const editorOptions = {
  fontSize: 22,
  fontFamily:
    'MonoLisa, Monaco, "Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
  formatOnType: true,
  formatOnPaste: true,
  automaticLayout: true,
  showFoldingControls: "mouseover",
  showUnused: true,
  smoothScrolling: true,
  wordWrap: "off",
  minimap: {
    enabled: true,
    side: "right",
    showSlider: "mouseover",
    renderCharacters: false,
  },
  lineNumbers: "on",
  renderControlCharacters: true,
  cursorStyle: "line",
  cursorBlinking: "blink",
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  autoIndent: "full",
  tabSize: 4,
  insertSpaces: true,
  highlightActiveIndentGuide: true,
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: "on",
  parameterHints: { enabled: true, cycle: true },
  scrollbar: {
    vertical: "auto",
    horizontal: "auto",
    useShadows: true,
    verticalScrollbarSize: 14,
    horizontalScrollbarSize: 14,
  },
  fontLigatures: true,
  selectionHighlight: true,
  renderLineHighlight: "all",
  folding: true,
  foldingStrategy: "indentation",
  lineDecorationsWidth: 10,
  rulers: [80, 120],
  glyphMargin: true,
  scrollBeyondLastColumn: 5,
  scrollBeyondLastLine: true,
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    // bracketPairsHorizontal: true,
    highlightActiveBracketPair: true,
    indentation: true,
    highlightActiveIndentation: true,
  },
  hover: { enabled: true, delay: 300, sticky: true },
  contextmenu: true,
  mouseWheelZoom: false, //Double finger zoom-in/out
  multiCursorModifier: "ctrlCmd",
  accessibilitySupport: "auto",
  colorDecorators: true,
  dragAndDrop: true,
  emptySelectionClipboard: true,
  copyWithSyntaxHighlighting: true,
  wordBasedSuggestions: true,
  wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
  occurrencesHighlight: true,
  renderWhitespace: "selection",
  inlineSuggest: { enabled: true },
};

// Mock themes data since we can't import the actual themes
const mockThemes = {
  vs: "Light",
  "vs-dark": "Dark",
  "hc-black": "High Contrast Dark",
  monokai: "Monokai",
  github: "GitHub",
  dracula: "Dracula",
  "tomorrow-night": "Tomorrow Night",
  "solarized-dark": "Solarized Dark",
  "solarized-light": "Solarized Light",
  cobalt: "Cobalt",
  nord: "Nord",
};

function App() {
  const editorRef = useRef(null);
  const [code, setCode] = useState(`console.log("Hello, World!");`);
  const [outputs, setOutputs] = useState([]);
  const [theme, setTheme] = useState("vs-dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [fontSize, setFontSize] = useState(editorOptions.fontSize ?? 22);
  const [wordWrap, setWordWrap] = useState("off");
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState("on");
  const [renderWhitespace, setRenderWhitespace] = useState("selection");
  const [showSettings, setShowSettings] = useState(false);
  const [availableThemes, setAvailableThemes] = useState([]);

  useEffect(() => {
    // Load available themes
    const themeArray = Object.entries(mockThemes).map(([id, name]) => ({
      id,
      name,
    }));
    setAvailableThemes(themeArray);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      theme === "vs-dark" || theme !== "vs"
    );
  }, [theme]);

  const runCode = () => {
    if (language === "javascript") {
      try {
        // Clear previous outputs
        setOutputs([]);

        // Create worker for code execution
        const worker = new Worker("./worker.js");

        worker.onmessage = (event) => {
          setOutputs((prevOutputs) => [...prevOutputs, event.data]);
        };

        worker.onerror = (error) => {
          setOutputs((prevOutputs) => [
            ...prevOutputs,
            {
              type: "error",
              content: [
                {
                  type: "error",
                  value: `Worker Error: ${error.message}`,
                  raw: error,
                },
              ],
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        };

        worker.postMessage(code);

        // Clean up worker after execution
        setTimeout(() => {
          worker.terminate();
        }, 5000);
      } catch (error) {
        setOutputs((prev) => [
          ...prev,
          {
            type: "error",
            content: [
              {
                type: "error",
                value: error.toString(),
                raw: error,
              },
            ],
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } else if (language === "html") {
      const blob = new Blob([code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setOutputs([
        <iframe
          key="iframe"
          src={url}
          style={{
            width: "100%",
            height: "300px",
            border: "none",
            borderRadius: "8px",
          }}
        />,
      ]);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "vs" ? "vs-dark" : "vs"));
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
  };

  const clearOutput = () => {
    setOutputs([]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Error attempting to enable full-screen mode:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error("Error attempting to exit full-screen mode:", err);
        });
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    // Configure Monaco editor instance
    monaco.editor.setTheme(theme);
  };

  // Dynamic editor options that update based on user preferences
  const getDynamicEditorOptions = () => ({
    ...editorOptions,
    fontSize,
    wordWrap,
    minimap: { ...editorOptions.minimap, enabled: minimap },
    lineNumbers,
    renderWhitespace,
    theme: theme,
  });

  const formatOutput = (output, index) => {
    if (React.isValidElement(output)) {
      return output;
    }

    const renderValue = (item, itemIndex) => {
      if (!item || typeof item === "string") {
        return (
          <span key={itemIndex} className="text-green-400">
            {item}
          </span>
        );
      }

      const { type, value, raw } = item;

      switch (type) {
        case "string":
          return (
            <span key={itemIndex} className="text-yellow-300">
              "{raw}"
            </span>
          );
        case "number":
          return (
            <span key={itemIndex} className="text-blue-300">
              {value}
            </span>
          );
        case "boolean":
          return (
            <span key={itemIndex} className="text-purple-300">
              {value}
            </span>
          );
        case "null":
          return (
            <span key={itemIndex} className="text-gray-400">
              null
            </span>
          );
        case "undefined":
          return (
            <span key={itemIndex} className="text-gray-400">
              undefined
            </span>
          );
        case "function":
          return (
            <span
              key={itemIndex}
              className="text-cyan-300"
              title={item.preview}
            >
              {value}
            </span>
          );
        case "array":
          return (
            <span
              key={itemIndex}
              className="text-cyan-300"
              title={`Array(${item.length})`}
            >
              {value}
            </span>
          );
        case "object":
          return (
            <span
              key={itemIndex}
              className="text-cyan-300"
              title={`Object with ${item.keys || 0} keys`}
            >
              {value}
            </span>
          );
        case "date":
          return (
            <span key={itemIndex} className="text-pink-300">
              {value}
            </span>
          );
        case "regexp":
          return (
            <span key={itemIndex} className="text-orange-300">
              {value}
            </span>
          );
        case "error":
          return (
            <span key={itemIndex} className="text-red-400" title={item.stack}>
              {value}
            </span>
          );
        default:
          return (
            <span key={itemIndex} className="text-green-400">
              {value}
            </span>
          );
      }
    };

    const getOutputIcon = (type) => {
      switch (type) {
        case "error":
          return <span className="text-red-400">✖</span>;
        case "warn":
          return <span className="text-yellow-400">⚠</span>;
        case "info":
          return <span className="text-blue-400">ℹ</span>;
        case "time":
          return <span className="text-purple-400">⏱</span>;
        case "count":
          return <span className="text-green-400">#</span>;
        case "table":
          return <span className="text-cyan-400">⊞</span>;
        default:
          return <span className="text-green-400">▶</span>;
      }
    };

    const getOutputClass = (type) => {
      switch (type) {
        case "error":
          return "border-l-4 border-red-500 bg-red-900/20 text-red-200";
        case "warn":
          return "border-l-4 border-yellow-500 bg-yellow-900/20 text-yellow-200";
        case "info":
          return "border-l-4 border-blue-500 bg-blue-900/20 text-blue-200";
        case "time":
          return "border-l-4 border-purple-500 bg-purple-900/20 text-purple-200";
        case "count":
          return "border-l-4 border-green-500 bg-green-900/20 text-green-200";
        default:
          return "text-green-400";
      }
    };

    // Handle table output
    if (output.type === "table") {
      return (
        <div key={index} className="mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            {getOutputIcon("table")}
            <span>{output.timestamp}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-600 rounded">
              <thead>
                <tr className="bg-slate-800">
                  {output.content.length > 0 &&
                    Object.keys(output.content[0]).map((key) => (
                      <th
                        key={key}
                        className="border border-slate-600 px-2 py-1 text-left text-cyan-300"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {output.content.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-800/50">
                    {Object.values(row).map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-slate-600 px-2 py-1"
                      >
                        {typeof cell === "object"
                          ? JSON.stringify(cell)
                          : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`mb-2 p-2 rounded ${getOutputClass(output.type)}`}
      >
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 min-w-fit">
            {getOutputIcon(output.type)}
            <span>{output.timestamp}</span>
          </div>
          <div className="flex-1 font-mono text-sm">
            {output.content.map((item, itemIndex) => (
              <span key={itemIndex}>
                {itemIndex > 0 && " "}
                {renderValue(item, itemIndex)}
              </span>
            ))}
          </div>
        </div>
        {output.type === "error" && output.content[0]?.stack && (
          <details className="mt-2 text-xs">
            <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
              Stack trace
            </summary>
            <pre className="mt-1 text-red-300 whitespace-pre-wrap bg-slate-900/50 p-2 rounded">
              {output.content[0].stack}
            </pre>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
      <div
        className={`container mx-auto p-4 h-screen flex flex-col ${
          isFullscreen ? "p-0" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Code className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Code Editor Pro
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="javascript">JavaScript</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105"
                title="Theme Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-12 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-64 max-h-96 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Editor Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Editor Theme
                      </label>
                      <select
                        value={theme}
                        onChange={handleThemeChange}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {availableThemes.map(({ id, name }) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="32"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Word Wrap
                      </label>
                      <select
                        value={wordWrap}
                        onChange={(e) => setWordWrap(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        <option value="off">Off</option>
                        <option value="on">On</option>
                        <option value="wordWrapColumn">Word Wrap Column</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Line Numbers
                      </label>
                      <select
                        value={lineNumbers}
                        onChange={(e) => setLineNumbers(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        <option value="on">On</option>
                        <option value="off">Off</option>
                        <option value="relative">Relative</option>
                        <option value="interval">Interval</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Render Whitespace
                      </label>
                      <select
                        value={renderWhitespace}
                        onChange={(e) => setRenderWhitespace(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        <option value="none">None</option>
                        <option value="boundary">Boundary</option>
                        <option value="selection">Selection</option>
                        <option value="trailing">Trailing</option>
                        <option value="all">All</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Minimap
                      </label>
                      <button
                        onClick={() => setMinimap(!minimap)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          minimap
                            ? "bg-blue-600"
                            : "bg-slate-200 dark:bg-slate-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            minimap ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105"
              title={
                theme === "vs" ? "Switch to Dark Mode" : "Switch to Light Mode"
              }
            >
              {theme === "vs" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Editor Panel */}
          <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="ml-2 font-medium">
                  main.{language === "javascript" ? "js" : language}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Lines: {code.split("\n").length}
              </div>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                theme={theme}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={getDynamicEditorOptions()}
                onMount={handleEditorDidMount}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="w-96 flex flex-col bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Terminal className="w-4 h-4" />
                <span className="font-medium">Console Output</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={runCode}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                  title="Run Code"
                >
                  <Play className="w-3 h-3" />
                  Run
                </button>
                <button
                  onClick={clearOutput}
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                  title="Clear Output"
                >
                  <Eraser className="w-3 h-3" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? (
                    <Maximize className="w-3 h-3" />
                  ) : (
                    <Expand className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-slate-900 text-green-400 font-mono text-sm">
              {outputs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No output yet. Click Run to execute your code.</p>
                </div>
              ) : (
                outputs.map((output, index) => formatOutput(output, index))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
