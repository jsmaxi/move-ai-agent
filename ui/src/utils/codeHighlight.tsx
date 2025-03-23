import { toast } from "sonner";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";

export const LANGUAGES = {
  move: "move",
  javascript: "javascript",
  typescript: "typescript",
  toml: "toml",
} as const;

export type SupportedLanguage = keyof typeof LANGUAGES;

export interface CodeFile {
  name: string;
  language: SupportedLanguage;
  content: string;
}

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy code");
  }
};

export const highlightCode = (
  code: string,
  language: SupportedLanguage
): string => {
  try {
    return Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.plaintext,
      language
    );
  } catch (error) {
    console.error("Error highlighting code:", error);
    return code;
  }
};
