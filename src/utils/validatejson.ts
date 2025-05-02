export function cleanAndValidateJSON(jsonString:string) {
    try {
      // Try parsing directly
      return { valid: true, json: JSON.parse(jsonString) };
    } catch (e) {
      // Attempt to clean the string
      try {
        let cleaned = jsonString
          .replace(/,\s*}/g, '}')         // Remove trailing commas before }
          .replace(/,\s*]/g, ']')         // Remove trailing commas before ]
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure keys are in double quotes
          .replace(/'/g, '"');            // Replace single quotes with double quotes
  
        return { valid: true, json: JSON.parse(cleaned), cleaned };
      } catch (e2) {
        throw new Error("Invalid JSON and couldn't clean it");
      }
    }
  }
  