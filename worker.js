// worker.js
self.onmessage = (event) => {
  const code = event.data;
  try {
    console.log = (...args) => {
      const formatValue = (value) => {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (Array.isArray(value)) {
          return `[${value.map(item => formatValue(item)).join(', ')}]`;
        }
        if (typeof value === 'object') {
          try {
            return JSON.stringify(value, null, 2);
          } catch {
            return value.toString();
          }
        }
        if (typeof value === 'string') return `"${value}"`;
        return String(value);
      };

      const formattedArgs = args.map(formatValue);

      self.postMessage({
        type: 'log',
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    console.error = (...args) => {
      const formattedArgs = args.map(arg => String(arg));
      self.postMessage({
        type: 'error',
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    (new Function(code))();
  } catch (error) {
    self.postMessage({
      type: 'error',
      content: [error.toString()],
      timestamp: new Date().toLocaleTimeString()
    });
  }
};