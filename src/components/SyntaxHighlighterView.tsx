import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area'; // Shadcn component

interface SyntaxHighlighterViewProps {
  code: string | null; // Can be null if no file is selected
  fileName?: string; // For context, e.g., display in header
  // language?: string; // For actual syntax highlighting, not used in this basic version
}

const SyntaxHighlighterView: React.FC<SyntaxHighlighterViewProps> = ({ code, fileName }) => {
  console.log("Rendering SyntaxHighlighterView for fileName:", fileName);

  if (code === null || code === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        Select a file to view its content.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
      {/* A real implementation would use a syntax highlighting library here */}
      {/* For now, a simple pre-code block */}
      <pre className="text-sm whitespace-pre-wrap break-all">
        <code className="font-mono">
          {code}
        </code>
      </pre>
      <p className="mt-2 text-xs text-gray-400">
        Note: This is a basic code view. Full syntax highlighting would require a dedicated library.
      </p>
    </ScrollArea>
  );
};

export default SyntaxHighlighterView;