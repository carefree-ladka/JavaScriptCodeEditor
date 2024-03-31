self.onmessage = (event) => {
  const code = event.data;
  try {
    // Override console.log to send messages back to the main thread
    console.log = (args) => {
      self.postMessage(args);
    };

    // Execute the code
     (new Function(code))();
  } catch (error) {
    // If an error occurs, send the error message back to the main thread
    self.postMessage(error.toString());
  }
};