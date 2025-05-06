export function convertToObjects(text: string) {
    const matches = text.matchAll(
      /^\s*(\d+)\. \*\*(.+?)\*\*:\s*([\s\S]*?)(?=^\s*\d+\. \*\*|\s*$)/gm
    );
    const result: { title: string; content: string }[] = [];
  
    for (const match of matches) {
      const [, , title, content] = match;
      result.push({
        title: title.trim(),
        content: content.replace(/^\s*-\s*/gm, '').trim()
      });
    }
  
    return result;
  }