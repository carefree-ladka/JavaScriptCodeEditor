self.onmessage = (event) => {
  const code = event.data;
  try {
    // Override console.log to send all messages back to the main thread in one line
    console.log = (...args) => {
      let message = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          return JSON.stringify(arg);
        } else {
          return arg.toString();
        }
      }).join(" "); // Concatenate all arguments into a single string with spaces

      self.postMessage(message);
    };

    // Execute the code
    (new Function(code))();
  } catch (error) {
    // If an error occurs, send the error message back to the main thread
    self.postMessage(error.toString());
  }
};
