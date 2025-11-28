export interface HighlightConfig {
  searchQuery: string;
  highlightColor?: string;
  highlightTextColor?: string;
  caseSensitive?: boolean;
}

export const highlightSearchTerms = (
  text: string,
  config: HighlightConfig
): string => {
  if (!config.searchQuery.trim() || !text) {
    return text;
  }

  const {
    searchQuery,
    highlightColor = '#fef3c7',
    highlightTextColor = '#92400e',
    caseSensitive = false,
  } = config;

  // Split search query into individual terms
  const searchTerms = searchQuery
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

  if (searchTerms.length === 0) {
    return text;
  }

  let highlightedText = text;

  // Highlight each search term
  searchTerms.forEach(term => {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${escapeRegExp(term)})`, flags);

    highlightedText = highlightedText.replace(
      regex,
      `<mark style="background-color: ${highlightColor}; color: ${highlightTextColor}; padding: 2px 4px; border-radius: 4px; font-weight: 600;">$1</mark>`
    );
  });

  return highlightedText;
};

export const highlightSearchTermsInHTML = (
  html: string,
  config: HighlightConfig
): string => {
  if (!config.searchQuery.trim() || !html) {
    return html;
  }

  // Parse HTML and highlight text content while preserving HTML structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Function to recursively process text nodes
  const processTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim()) {
        const highlightedText = highlightSearchTerms(text, config);
        if (highlightedText !== text) {
          const wrapper = document.createElement('span');
          wrapper.innerHTML = highlightedText;
          node.parentNode?.replaceChild(wrapper, node);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script and style tags
      const tagName = (node as Element).tagName.toLowerCase();
      if (tagName !== 'script' && tagName !== 'style') {
        Array.from(node.childNodes).forEach(processTextNodes);
      }
    }
  };

  processTextNodes(doc.body);
  return doc.body.innerHTML;
};

// Helper function to escape special regex characters
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// React Native specific highlighting for RenderHTML
export const createHighlightedHTML = (
  content: string,
  searchQuery: string,
  isDarkMode: boolean = false
): string => {
  if (!searchQuery.trim()) {
    return content;
  }

  const highlightConfig: HighlightConfig = {
    searchQuery,
    highlightColor: isDarkMode ? '#451a03' : '#fef3c7',
    highlightTextColor: isDarkMode ? '#fbbf24' : '#92400e',
    caseSensitive: false,
  };

  // Clean the content first (remove extra whitespace, normalize)
  const cleanContent = content
    .replace(/\s+/g, ' ')
    .trim();

  return highlightSearchTerms(cleanContent, highlightConfig);
};

// Alternative approach for React Native Text highlighting
export interface TextHighlightPart {
  text: string;
  isHighlighted: boolean;
}

export const splitTextForHighlighting = (
  text: string,
  searchQuery: string
): TextHighlightPart[] => {
  if (!searchQuery.trim()) {
    return [{ text, isHighlighted: false }];
  }

  const searchTerms = searchQuery
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

  if (searchTerms.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // Create a combined regex for all search terms
  const regexPattern = searchTerms
    .map(term => escapeRegExp(term))
    .join('|');

  const regex = new RegExp(`(${regexPattern})`, 'gi');

  const parts: TextHighlightPart[] = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isHighlighted: false,
      });
    }

    // Add highlighted match
    parts.push({
      text: match[0],
      isHighlighted: true,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isHighlighted: false,
    });
  }

  return parts.filter(part => part.text.length > 0);
};
