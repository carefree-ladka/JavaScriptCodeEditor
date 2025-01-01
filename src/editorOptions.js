//https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IEditorConstructionOptions.html#stickyScroll

export default {
  fontSize: 26, // Set the font size of the editor
  semicolon: true,
  fontFamily: 'Monaco, MonoLisa, monospace', // Set the font family (you can use any monospace font)
  formatOnType: true, // Enable auto-formatting on type
  formatOnPaste: true, // Enable auto-formatting on paste
  formatOnSave: true, // Enable auto-formatting on save
  automaticLayout: true, // Automatically adjust the editor's layout
  showFoldingControls: 'hover', // Always show folding controls
  showUnused: true, // Show unused variables (helps with code analysis)
  smoothScrolling: true, // Enable smooth scrolling
  wordWrap: 'off', // Disable word wrapping (lines stay on the same horizontal plane)
  stickyScroll: true, // Sticky scroll to keep the current line visible while scrolling
  minimap: { enabled: true, side: 'right' }, // Enable minimap, positioned to the right
  lineNumbers: 'on', // Show line numbers
  // renderWhitespace: 'boundary', // Render whitespace characters as visible markers
  renderControlCharacters: true, // Show control characters in the editor
  cursorStyle: 'line', // Set cursor style to 'line' (other options: 'block', 'underline')
  cursorBlinking: 'blink', // Enable cursor blinking (other options: 'smooth', 'phase', 'expand')
  autoClosingBrackets: true, // Automatically close brackets
  autoClosingQuotes: true, // Automatically close quotes
  autoIndent: 'full', // Enable auto-indentation (full, advanced, none)
  tabSize: 2, // Set the tab size to 2 spaces (common in JavaScript/TypeScript)
  insertSpaces: true, // Use spaces instead of tabs for indentation
  highlightActiveIndentGuide: true, // Highlight the current indent guide
  find: {
    autoFindInSelection: 'never', // Enable search within selection automatically
  },
  quickSuggestions: {
    other: true, // Enable quick suggestions for other content
    comments: true, // Enable quick suggestions inside comments
    strings: true, // Enable quick suggestions inside strings
  },
  suggestOnTriggerCharacters: true, // Show suggestions when trigger characters are typed
  parameterHints: true, // Enable parameter hints while typing function parameters
  autoSave: 'onWindowChange', // Automatically save file when window loses focus
  scrollbar: {
    vertical: 'auto', // Show vertical scrollbar when necessary
    horizontal: 'auto', // Show horizontal scrollbar when necessary
  },
  overviewRulerLanes: 3, // Enable overview ruler with 3 lanes
  fontLigatures: true, // Enable font ligatures (if supported by the font)
  selectionHighlight: true, // Highlight all instances of the selected word
  renderLineHighlight: 'all', // Highlight the entire current line (similar to VSCode)
  folding: true, // Enable code folding
  lineDecorationsWidth: 10, // Adjust the width for decorations (such as breakpoint indicators)
  rulers: [120], // Add visual guide for 120 characters
  glyphMargin: false, // Disable glyph margin (white dots on the left side)
  scrollBeyondLastColumn: 5, // Add a slight margin for horizontal scrolling
};