/**
 * Options for safeStringify function
 */
export interface SafeStringifyOptions {
  /**
   * Maximum recursion depth (default: 10)
   */
  maxDepth?: number;
  /**
   * Maximum string length in bytes (default: 1MB)
   */
  maxLength?: number;
  /**
   * Array of sensitive key patterns to mask in log output
   */
  sensitiveKeys?: string[];
}

/**
 * Safely converts an object to a JSON string, handling circular references and special types.
 * Optimized for NestJS Seq logging with comprehensive safety checks.
 *
 * Updated by Jason.Song (成长的小猪) on 2025/08/07 12:12:04
 *
 * Added by Jason.Song (成长的小猪) on 2023/11/22 19:17:54
 * @param obj The object to be converted to a JSON string.
 * @param options Optional configuration options for stringification.
 * @returns A JSON string representing the object, handling circular references and special types.
 */
export function safeStringify(
  obj: any,
  options?: SafeStringifyOptions,
): string {
  // Extract options with defaults
  const maxDepth = options?.maxDepth ?? 10;
  const maxLength = options?.maxLength ?? 1024 * 1024;
  const sensitiveKeys = options?.sensitiveKeys;

  // Fast path for primitives
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }

  if (typeof obj !== 'object') {
    try {
      return JSON.stringify(obj);
    } catch {
      return JSON.stringify(String(obj));
    }
  }

  // Use comprehensive object processing
  try {
    const processed = processValue(
      obj,
      new WeakMap(),
      0,
      'root',
      maxDepth,
      sensitiveKeys,
    );
    const result = JSON.stringify(processed);

    // Check length limit
    if (result.length > maxLength) {
      return JSON.stringify({
        __error: 'Object too large for serialization',
        __originalSize: result.length,
        __maxAllowed: maxLength,
        __preview: result.substring(0, Math.min(500, maxLength / 4)) + '...',
        __timestamp: new Date().toISOString(),
      });
    }

    return result;
  } catch (error) {
    // Ultimate fallback
    return JSON.stringify({
      __stringifyError: true,
      __message: error instanceof Error ? error.message : String(error),
      __originalType: typeof obj,
      __timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Process any value with comprehensive safety checks
 */
function processValue(
  value: any,
  visited: WeakMap<object, string>,
  depth: number,
  path: string,
  maxDepth: number,
  sensitiveKeys?: string[],
): any {
  // Depth protection
  if (depth > maxDepth) {
    return `[Max depth ${maxDepth} exceeded at ${path}]`;
  }

  // Handle primitives
  if (value === null || value === undefined) {
    return value;
  }

  // Handle non-object types
  if (typeof value !== 'object') {
    return processPrimitive(value);
  }

  // Circular reference detection
  if (visited.has(value)) {
    const originalPath = visited.get(value);
    if (!originalPath) {
      return `[Circular → unknown]`;
    }

    // Show more concise circular reference notation
    if (originalPath === 'root') {
      return `[Circular → self]`;
    } else {
      // Simplify path display by removing 'root.' prefix for better readability
      const displayOriginal = originalPath.startsWith('root.')
        ? originalPath.substring(5)
        : originalPath;
      return `[Circular → ${displayOriginal}]`;
    }
  }

  // Add to visited set
  visited.set(value, path);

  try {
    // Handle special object types
    if (value instanceof Error) {
      return processError(value);
    }

    if (value instanceof Date) {
      return processDate(value);
    }

    if (value instanceof RegExp) {
      // Return the string representation directly for better readability
      return value.toString();
    }

    if (value instanceof Set) {
      return processSet(value, visited, depth, path, maxDepth, sensitiveKeys);
    }

    if (value instanceof Map) {
      return processMap(value, visited, depth, path, maxDepth, sensitiveKeys);
    }

    // Handle Buffer (Node.js specific)
    if (typeof Buffer !== 'undefined' && value instanceof Buffer) {
      return {
        __type: 'Buffer',
        length: value.length,
        preview: value.slice(0, 16).toString('hex'),
        __note:
          value.length > 16 ? `... and ${value.length - 16} more bytes` : '',
      };
    }

    // Handle TypedArrays
    if (ArrayBuffer.isView(value)) {
      return {
        __type: 'TypedArray',
        constructor: value.constructor.name,
        length: (value as any).length,
        byteLength: value.byteLength,
        preview: Array.from(value as any).slice(0, 8),
      };
    }

    // Handle Arrays
    if (Array.isArray(value)) {
      return processArray(value, visited, depth, path, maxDepth, sensitiveKeys);
    }

    // Handle plain objects
    return processObject(value, visited, depth, path, maxDepth, sensitiveKeys);
  } finally {
    // Clean up visited reference
    visited.delete(value);
  }
}

/**
 * Process primitive types with special handling
 */
function processPrimitive(value: any): any {
  switch (typeof value) {
    case 'undefined':
      return '[Undefined]';
    case 'function':
      return {
        __type: 'Function',
        name: value.name || 'anonymous',
        length: value.length,
      };
    case 'symbol':
      // Return the string representation directly for better readability
      return value.toString();
    case 'bigint':
      // Return the string representation with 'n' suffix for clarity
      return value.toString() + 'n';
    case 'number':
      if (!isFinite(value)) {
        return {
          __type: 'Number',
          __special: isNaN(value)
            ? 'NaN'
            : value > 0
              ? 'Infinity'
              : '-Infinity',
        };
      }
      return value;
    default:
      return value;
  }
}

/**
 * Process Error objects with comprehensive information extraction
 */
function processError(error: Error): any {
  const result: any = {
    __type: 'Error',
    name: error.name,
    message: error.message,
  };

  // Include stack trace
  if (error.stack) {
    result.stack = error.stack;
  }

  // Extract additional properties
  const additionalProps: any = {};
  for (const key of Object.getOwnPropertyNames(error)) {
    if (!['name', 'message', 'stack'].includes(key)) {
      try {
        additionalProps[key] = (error as any)[key];
      } catch {
        additionalProps[key] = '[Unreadable property]';
      }
    }
  }

  if (Object.keys(additionalProps).length > 0) {
    result.additionalProperties = additionalProps;
  }

  return result;
}

/**
 * Process Date objects with validation
 */
function processDate(date: Date): any {
  if (isNaN(date.getTime())) {
    return {
      __type: 'Date',
      __invalid: true,
      __string: date.toString(),
    };
  }

  // Return the ISO string directly for valid dates to maintain readability
  return date.toISOString();
}

/**
 * Process Set objects
 */
function processSet(
  set: Set<any>,
  visited: WeakMap<object, string>,
  depth: number,
  path: string,
  maxDepth: number,
  sensitiveKeys?: string[],
): any {
  const values = Array.from(set);
  const maxItems = Math.min(values.length, 100); // Limit for performance

  return {
    __type: 'Set',
    size: set.size,
    values: values
      .slice(0, maxItems)
      .map((item, index) =>
        processValue(
          item,
          visited,
          depth + 1,
          `${path}.Set[${index}]`,
          maxDepth,
          sensitiveKeys,
        ),
      ),
    ...(set.size > maxItems && {
      __truncated: `... and ${set.size - maxItems} more items`,
    }),
  };
}

/**
 * Process Map objects
 */
function processMap(
  map: Map<any, any>,
  visited: WeakMap<object, string>,
  depth: number,
  path: string,
  maxDepth: number,
  sensitiveKeys?: string[],
): any {
  const entries = Array.from(map.entries());
  const maxItems = Math.min(entries.length, 100); // Limit for performance

  return {
    __type: 'Map',
    size: map.size,
    entries: entries
      .slice(0, maxItems)
      .map(([key, value], index) => [
        processValue(
          key,
          visited,
          depth + 1,
          `${path}.Map[${index}].key`,
          maxDepth,
          sensitiveKeys,
        ),
        processValue(
          value,
          visited,
          depth + 1,
          `${path}.Map[${index}].value`,
          maxDepth,
          sensitiveKeys,
        ),
      ]),
    ...(map.size > maxItems && {
      __truncated: `... and ${map.size - maxItems} more entries`,
    }),
  };
}

/**
 * Process arrays with size limits
 */
function processArray(
  array: any[],
  visited: WeakMap<object, string>,
  depth: number,
  path: string,
  maxDepth: number,
  sensitiveKeys?: string[],
): any[] {
  const maxItems = Math.min(array.length, 1000); // Reasonable limit for logs
  const result: any[] = [];

  for (let i = 0; i < maxItems; i++) {
    try {
      result[i] = processValue(
        array[i],
        visited,
        depth + 1,
        `${path}[${i}]`,
        maxDepth,
        sensitiveKeys,
      );
    } catch (error) {
      result[i] = `[Error processing array item: ${
        error instanceof Error ? error.message : String(error)
      }]`;
    }
  }

  // Add truncation notice if needed
  if (array.length > maxItems) {
    result.push(`[... and ${array.length - maxItems} more items]`);
  }

  return result;
}

/**
 * Process plain objects with property limits and sensitive data masking
 */
function processObject(
  obj: any,
  visited: WeakMap<object, string>,
  depth: number,
  path: string,
  maxDepth: number,
  sensitiveKeys?: string[],
): any {
  const result: any = {};
  const keys = Object.keys(obj);
  const maxProps = Math.min(keys.length, 1000); // Reasonable limit
  // Use provided sensitiveKeys or no masking if not provided
  const effectiveSensitiveKeys = sensitiveKeys;

  let processedProps = 0;
  for (const key of keys) {
    if (processedProps >= maxProps) break;

    try {
      // Check for sensitive data only if sensitiveKeys is provided
      if (
        effectiveSensitiveKeys &&
        effectiveSensitiveKeys.some((sensitive: string) =>
          key.toLowerCase().includes(sensitive.toLowerCase()),
        )
      ) {
        result[key] = '[Sensitive data masked]';
        processedProps++;
        continue;
      }

      result[key] = processValue(
        obj[key],
        visited,
        depth + 1,
        `${path}.${key}`,
        maxDepth,
        sensitiveKeys,
      );
      processedProps++;
    } catch (error) {
      result[key] = `[Error processing property: ${
        error instanceof Error ? error.message : String(error)
      }]`;
      processedProps++;
    }
  }

  // Add truncation notice if needed
  if (keys.length > maxProps) {
    result.__truncated = `... and ${keys.length - maxProps} more properties`;
  }

  return result;
}
