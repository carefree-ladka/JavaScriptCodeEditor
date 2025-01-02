// worker.js
self.onmessage = (event) => {
  const code = event.data;
  try {
    // Create a more sophisticated console.log override
    console.log = (...args) => {
      const formattedArgs = args.map(arg => {
        if (arg === undefined) return 'undefined';
        if (arg === null) return 'null';
        if (typeof arg === 'object') {
          try {
            // Handle circular references and prettier formatting
            return JSON.stringify(arg, null, 2);
          } catch {
            return arg.toString();
          }
        }
        if (typeof arg === 'string') return `"${arg}"`;
        return String(arg);
      });

      self.postMessage({
        type: 'log',
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    // Add support for console.error
    console.error = (...args) => {
      const formattedArgs = args.map(arg => String(arg));
      self.postMessage({
        type: 'error',
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    // Execute the code
    (new Function(code))();
  } catch (error) {
    self.postMessage({
      type: 'error',
      content: [error.toString()],
      timestamp: new Date().toLocaleTimeString()
    });
  }
};