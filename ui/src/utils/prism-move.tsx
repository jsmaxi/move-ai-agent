import Prism from "prismjs";

Prism.languages.move = {
  comment: [
    {
      pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
      lookbehind: true,
    },
    {
      pattern: /(^|[^\\:])\/\/.*/,
      lookbehind: true,
      greedy: true,
    },
  ],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true,
  },
  keyword:
    /\b(?:address|acquires|as|break|const|continue|copy|copy_loc|drop|else|false|if|invariant|let|loop|module|move|move_from|move_to|mut|native|public|return|script|spec|struct|true|use|while|fun|entry|friend)\b/,
  boolean: /\b(?:true|false)\b/,
  function: /[a-z0-9_$]+(?=\s*\()/i,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
  punctuation: /[{}[\];(),.:]/,
  "class-name": {
    pattern: /(\b(?:address|module|struct|resource|fun)\s+)[A-Z][\w']*/,
    lookbehind: true,
  },
};
