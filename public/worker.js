// worker.js
self.onmessage = (event) => {
  const code = event.data;

  try {
    // Enhanced console.log with better formatting
    console.log = (...args) => {
      const formatValue = (value, depth = 0, maxDepth = 10) => {
        // Prevent infinite recursion
        if (depth > maxDepth)
          return { type: "object", value: "[Max Depth Reached]", raw: value };

        // Handle primitive types
        if (value === undefined)
          return { type: "undefined", value: "undefined", raw: undefined };
        if (value === null) return { type: "null", value: "null", raw: null };
        if (typeof value === "boolean")
          return { type: "boolean", value: String(value), raw: value };
        if (typeof value === "number") {
          if (isNaN(value)) return { type: "number", value: "NaN", raw: value };
          if (!isFinite(value))
            return {
              type: "number",
              value: value > 0 ? "Infinity" : "-Infinity",
              raw: value,
            };
          return { type: "number", value: String(value), raw: value };
        }
        if (typeof value === "string")
          return { type: "string", value: `"${value}"`, raw: value };
        if (typeof value === "symbol")
          return { type: "symbol", value: value.toString(), raw: value };
        if (typeof value === "bigint")
          return { type: "bigint", value: `${value}n`, raw: value };
        if (typeof value === "function") {
          const funcStr = value.toString();
          const name = value.name || "anonymous";
          const preview =
            funcStr.length > 50 ? `${funcStr.substring(0, 47)}...` : funcStr;
          return {
            type: "function",
            value: `ƒ ${name}()`,
            preview,
            raw: value,
          };
        }

        // Handle arrays - FIXED: Show complete array structure
        if (Array.isArray(value)) {
          if (value.length === 0)
            return { type: "array", value: "[]", length: 0, raw: value };

          // Format all items, not just first 100
          const items = value.map((item) =>
            formatValue(item, depth + 1, maxDepth)
          );

          // Create a complete array representation
          const buildArrayString = (items) => {
            return `[${items
              .map((item) => {
                if (item.type === "array") {
                  return item.value; // This will be the complete nested array string
                }
                return item.value;
              })
              .join(", ")}]`;
          };

          const fullArrayString = buildArrayString(items);

          return {
            type: "array",
            value: fullArrayString,
            length: value.length,
            items: items,
            raw: value,
          };
        }

        // Handle dates
        if (value instanceof Date) {
          return {
            type: "date",
            value: isNaN(value.getTime())
              ? "Invalid Date"
              : value.toISOString(),
            raw: value,
          };
        }

        // Handle errors
        if (value instanceof Error) {
          return {
            type: "error",
            value: `${value.name}: ${value.message}`,
            stack: value.stack,
            raw: value,
          };
        }

        // Handle regular expressions
        if (value instanceof RegExp) {
          return { type: "regexp", value: value.toString(), raw: value };
        }

        // Handle objects
        if (typeof value === "object") {
          // Handle special objects
          if (value.constructor && value.constructor.name !== "Object") {
            return {
              type: "object",
              value: `${value.constructor.name} {...}`,
              constructor: value.constructor.name,
              raw: value,
            };
          }

          const keys = Object.keys(value);
          if (keys.length === 0)
            return { type: "object", value: "{}", raw: value };

          // Create a complete object preview
          const buildObjectString = (keys, obj, currentDepth) => {
            const pairs = keys.map((key) => {
              const formattedValue = formatValue(
                obj[key],
                currentDepth + 1,
                maxDepth
              );
              return `${key}: ${formattedValue.value}`;
            });
            return `{${pairs.join(", ")}}`;
          };

          const fullObjectString = buildObjectString(keys, value, depth);

          const properties = {};
          keys.forEach((key) => {
            try {
              properties[key] = formatValue(value[key], depth + 1, maxDepth);
            } catch (e) {
              properties[key] = {
                type: "error",
                value: "[Getter Error]",
                raw: null,
              };
            }
          });

          return {
            type: "object",
            value: fullObjectString,
            keys: keys.length,
            properties,
            raw: value,
          };
        }

        return { type: "unknown", value: String(value), raw: value };
      };

      const formattedArgs = args.map((arg) => formatValue(arg));

      self.postMessage({
        type: "log",
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString(),
        count: args.length,
      });
    };

    // Enhanced console.error
    console.error = (...args) => {
      const formattedArgs = args.map((arg) => {
        if (arg instanceof Error) {
          return {
            type: "error",
            value: `${arg.name}: ${arg.message}`,
            stack: arg.stack,
            raw: arg,
          };
        }
        return { type: "string", value: String(arg), raw: arg };
      });

      self.postMessage({
        type: "error",
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString(),
        count: args.length,
      });
    };

    // Enhanced console.warn
    console.warn = (...args) => {
      const formattedArgs = args.map((arg) => ({
        type: "string",
        value: String(arg),
        raw: arg,
      }));

      self.postMessage({
        type: "warn",
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString(),
        count: args.length,
      });
    };

    // Enhanced console.info
    console.info = (...args) => {
      const formattedArgs = args.map((arg) => ({
        type: "string",
        value: String(arg),
        raw: arg,
      }));

      self.postMessage({
        type: "info",
        content: formattedArgs,
        timestamp: new Date().toLocaleTimeString(),
        count: args.length,
      });
    };

    // Console.table support
    console.table = (data) => {
      let tableData = [];

      if (Array.isArray(data)) {
        tableData = data.map((item, index) => ({ index, ...item }));
      } else if (typeof data === "object" && data !== null) {
        tableData = Object.entries(data).map(([key, value]) => ({
          key,
          value,
        }));
      } else {
        tableData = [{ value: data }];
      }

      self.postMessage({
        type: "table",
        content: tableData,
        timestamp: new Date().toLocaleTimeString(),
      });
    };

    // Console.time and console.timeEnd support
    const timers = new Map();

    console.time = (label = "default") => {
      timers.set(label, performance.now());
    };

    console.timeEnd = (label = "default") => {
      if (timers.has(label)) {
        const duration = performance.now() - timers.get(label);
        timers.delete(label);

        self.postMessage({
          type: "time",
          content: [
            {
              type: "string",
              value: `${label}: ${duration.toFixed(3)}ms`,
              raw: duration,
            },
          ],
          timestamp: new Date().toLocaleTimeString(),
          label,
        });
      } else {
        self.postMessage({
          type: "warn",
          content: [
            {
              type: "string",
              value: `Timer '${label}' does not exist`,
              raw: label,
            },
          ],
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    };

    // Console.count support
    const counters = new Map();

    console.count = (label = "default") => {
      const current = counters.get(label) || 0;
      const newCount = current + 1;
      counters.set(label, newCount);

      self.postMessage({
        type: "count",
        content: [
          { type: "string", value: `${label}: ${newCount}`, raw: newCount },
        ],
        timestamp: new Date().toLocaleTimeString(),
        label,
        count: newCount,
      });
    };

    console.countReset = (label = "default") => {
      counters.delete(label);

      self.postMessage({
        type: "info",
        content: [
          { type: "string", value: `Counter '${label}' reset`, raw: label },
        ],
        timestamp: new Date().toLocaleTimeString(),
      });
    };

    // Add JSON object to global scope for JSON.stringify support
    if (typeof JSON === "undefined") {
      self.JSON = {
        stringify: (value, replacer, space) => {
          const stringify = (val, depth = 0) => {
            if (val === null) return "null";
            if (val === undefined) return undefined;
            if (typeof val === "boolean" || typeof val === "number")
              return String(val);
            if (typeof val === "string") return `"${val.replace(/"/g, '\\"')}"`;

            if (Array.isArray(val)) {
              const items = val
                .map((item) => stringify(item, depth + 1))
                .filter((item) => item !== undefined);
              if (space) {
                const indent = " ".repeat(
                  (depth + 1) *
                    (typeof space === "number" ? space : space.length)
                );
                const closeIndent = " ".repeat(
                  depth * (typeof space === "number" ? space : space.length)
                );
                return `[\n${indent}${items.join(
                  `,\n${indent}`
                )}\n${closeIndent}]`;
              }
              return `[${items.join(",")}]`;
            }

            if (typeof val === "object") {
              const pairs = Object.keys(val)
                .map((key) => {
                  const value = stringify(val[key], depth + 1);
                  return value !== undefined
                    ? `"${key}":${space ? " " : ""}${value}`
                    : null;
                })
                .filter((pair) => pair !== null);

              if (space) {
                const indent = " ".repeat(
                  (depth + 1) *
                    (typeof space === "number" ? space : space.length)
                );
                const closeIndent = " ".repeat(
                  depth * (typeof space === "number" ? space : space.length)
                );
                return `{\n${indent}${pairs.join(
                  `,\n${indent}`
                )}\n${closeIndent}}`;
              }
              return `{${pairs.join(",")}}`;
            }

            return String(val);
          };

          return stringify(value);
        },
        parse: (text) => {
          return eval(`(${text})`);
        },
      };
    }

    // Execute the code with better error handling
    // eslint-disable-next-line no-useless-catch
    try {
      new Function(code)();
    } catch (innerError) {
      // Re-throw with the original error to get better stack trace
      throw innerError;
    }
  } catch (error) {
    // Enhanced error line extraction for user code
    const extractLineInfo = (error, code) => {
      let lineNumber = null;
      let columnNumber = null;
      let errorLine = "";
      let contextLines = [];

      // First, try to parse syntax errors by attempting to compile the code line by line
      if (error instanceof SyntaxError && code) {
        const lines = code.split("\n");

        // Try to find the syntax error by testing each line cumulatively
        for (let i = 0; i < lines.length; i++) {
          try {
            const testCode = lines.slice(0, i + 1).join("\n");
            new Function(testCode);
          } catch (testError) {
            if (testError instanceof SyntaxError) {
              // Found the problematic line
              lineNumber = i + 1;
              errorLine = lines[i];

              // Try to extract column from the error message
              const columnMatch = error.message.match(
                /position (\d+)|column (\d+)|char (\d+)/i
              );
              if (columnMatch) {
                columnNumber = parseInt(
                  columnMatch[1] || columnMatch[2] || columnMatch[3],
                  10
                );
              }

              // If we can't find column from message, try to parse it from the line
              if (
                !columnNumber &&
                error.message.includes("Unexpected identifier")
              ) {
                // For "Unexpected identifier" errors, try to find the position
                const match = error.message.match(/'([^']+)'/);
                if (match && errorLine) {
                  const unexpectedToken = match[1];
                  const tokenIndex = errorLine.indexOf(unexpectedToken);
                  if (tokenIndex !== -1) {
                    columnNumber = tokenIndex + 1;
                  }
                }
              }

              break;
            }
          }
        }

        // If we still couldn't find it, default to line 1
        if (!lineNumber) {
          lineNumber = 1;
          errorLine = lines[0] || "";
        }
      } else {
        // For runtime errors, try to extract from stack trace
        const stack = error.stack || "";
        const patterns = [
          /<anonymous>:(\d+):(\d+)/,
          /Function:(\d+):(\d+)/,
          /eval:(\d+):(\d+)/,
          /at .*?:(\d+):(\d+)/,
        ];

        for (const pattern of patterns) {
          const match = stack.match(pattern);
          if (match) {
            // For Function constructor, the line numbers are relative to the function body
            lineNumber = parseInt(match[1], 10);
            columnNumber = match[2] ? parseInt(match[2], 10) : null;
            break;
          }
        }

        // Extract the error line if we found a line number
        if (lineNumber && code) {
          const lines = code.split("\n");
          const lineIndex = lineNumber - 1;
          if (lineIndex >= 0 && lineIndex < lines.length) {
            errorLine = lines[lineIndex];
          }
        }
      }

      // Generate context lines if we have a line number
      if (lineNumber && code) {
        const lines = code.split("\n");
        const lineIndex = lineNumber - 1;
        const contextStart = Math.max(0, lineIndex - 2);
        const contextEnd = Math.min(lines.length - 1, lineIndex + 2);

        for (let i = contextStart; i <= contextEnd; i++) {
          contextLines.push({
            lineNumber: i + 1,
            content: lines[i] || "",
            isErrorLine: i === lineIndex,
            columnNumber: i === lineIndex ? columnNumber : null,
          });
        }
      }

      return {
        lineNumber,
        columnNumber,
        errorLine,
        contextLines,
        hasLocation: lineNumber !== null,
      };
    };

    const lineInfo = extractLineInfo(error, code);

    // Create a more detailed error message
    let errorMessage = `${error.name}: ${error.message}`;
    if (lineInfo.hasLocation) {
      errorMessage += ` (Line ${lineInfo.lineNumber}`;
      if (lineInfo.columnNumber) {
        errorMessage += `, Column ${lineInfo.columnNumber}`;
      }
      errorMessage += ")";
    }

    self.postMessage({
      type: "error",
      content: [
        {
          type: "error",
          value: errorMessage,
          stack: error.stack,
          lineNumber: lineInfo.lineNumber,
          columnNumber: lineInfo.columnNumber,
          errorLine: lineInfo.errorLine,
          contextLines: lineInfo.contextLines,
          hasLocation: lineInfo.hasLocation,
          raw: error,
        },
      ],
      timestamp: new Date().toLocaleTimeString(),
      isRuntimeError: true,
      location: lineInfo.hasLocation
        ? {
            line: lineInfo.lineNumber,
            column: lineInfo.columnNumber,
            errorLine: lineInfo.errorLine,
            contextLines: lineInfo.contextLines,
          }
        : null,
    });
  }
};
