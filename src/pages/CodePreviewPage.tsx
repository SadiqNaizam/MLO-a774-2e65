import React, { useState, useEffect, useCallback } from 'react';
import {
  Resizable,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import FileTreeNavigator, { FileNode } from '@/components/FileTreeNavigator';
import SyntaxHighlighterView from '@/components/SyntaxHighlighterView';
import TabbedCodeEditorHeader, { TabInfo } from '@/components/TabbedCodeEditorHeader';
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast as sonnerToast } from "sonner"; // Using sonner for notifications
import { ScrollArea } from '@/components/ui/scroll-area'; // Though SyntaxHighlighterView might use it, including for completeness if direct use is needed
import { Copy, TriangleAlert, FileCode } from 'lucide-react';

// Placeholder data for file tree and contents
const initialFileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'src/App.tsx',
        name: 'App.tsx',
        type: 'file',
      },
      {
        id: 'src/components',
        name: 'components',
        type: 'folder',
        children: [
          { id: 'src/components/Button.tsx', name: 'Button.tsx', type: 'file' },
          { id: 'src/components/Card.tsx', name: 'Card.tsx', type: 'file' },
        ],
      },
      {
        id: 'src/pages',
        name: 'pages',
        type: 'folder',
        children: [
          { id: 'src/pages/Homepage.tsx', name: 'Homepage.tsx', type: 'file' },
          { id: 'src/pages/CodePreviewPage.tsx', name: 'CodePreviewPage.tsx', type: 'file'},
        ],
      },
    ],
  },
  {
    id: 'README.md',
    name: 'README.md',
    type: 'file',
  },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
  }
];

const fileContents: Record<string, string> = {
  'src/App.tsx': `import React from 'react';\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Homepage from './pages/Homepage';\n// ... other imports\n\nfunction App() {\n  console.log('App component mounted');\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<Homepage />} />\n        {/* Other routes */}\n      </Routes>\n    </BrowserRouter>\n  );\n}\n\nexport default App;`,
  'src/components/Button.tsx': `import React from 'react';\nimport { Button as ShadButton } from '@/components/ui/button'; // Assuming shadcn button\n\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';\n  size?: 'default' | 'sm' | 'lg' | 'icon';\n}\n\nconst Button: React.FC<ButtonProps> = ({ children, ...props }) => {\n  console.log('Custom Button rendering');\n  return <ShadButton {...props}>{children}</ShadButton>;\n};\n\nexport default Button;`,
  'src/components/Card.tsx': `import React from 'react';\nimport { Card as ShadCard, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';\n\ninterface CardProps {\n  title: string;\n  children: React.ReactNode;\n  footer?: React.ReactNode;\n}\n\nconst Card: React.FC<CardProps> = ({ title, children, footer }) => {\n  console.log('Custom Card rendering with title:', title);\n  return (\n    <ShadCard>\n      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>\n      <CardContent>{children}</CardContent>\n      {footer && <CardFooter>{footer}</CardFooter>}\n    </ShadCard>\n  );\n};\n\nexport default Card;`,
  'src/pages/Homepage.tsx': `import React from 'react';\n\nconst Homepage = () => {\n  console.log('Homepage loaded');\n  return <h1 className="text-2xl p-4">Welcome to the Homepage</h1>;\n};\n\nexport default Homepage;`,
  'src/pages/CodePreviewPage.tsx': `// Content of this file itself (meta, I know!)\n// This would typically be fetched or dynamically loaded.\n// For this demo, it's a placeholder.\nconsole.log('CodePreviewPage.tsx content would be here.');`,
  'README.md': `# Project Title\n\nThis is a sample README.md file for the project.\n\n## Features\n- Feature A\n- Feature B\n\n## Setup\n\`npm install\`\n\`npm start\`\n`,
  'package.json': `{\n  "name": "my-react-app",\n  "version": "0.1.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "react-router-dom": "^6.26.2",\n    // ... other dependencies\n  },\n  "scripts": {\n    "start": "vite", // or react-scripts start\n    "build": "vite build",\n    "serve": "vite preview"\n  }\n}`
};


const CodePreviewPage: React.FC = () => {
  console.log('CodePreviewPage loaded');

  const [fileTree] = useState<FileNode[]>(initialFileTree);
  const [openTabs, setOpenTabs] = useState<TabInfo[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [currentPathSegments, setCurrentPathSegments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const findNodeById = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const loadFileContent = useCallback((fileId: string) => {
    console.log('Attempting to load content for fileId:', fileId);
    const content = fileContents[fileId];
    if (content !== undefined) {
      setSelectedFileContent(content);
      setError(null);
    } else {
      setSelectedFileContent(`// Content for ${fileId} not found.`);
      // setError(`Content for file ${fileId} could not be loaded.`);
      console.warn(`Content for file ${fileId} not found in placeholder data.`);
    }
    const segments = fileId.split('/');
    setCurrentPathSegments(segments);
  }, []);


  const handleFileSelect = useCallback((node: FileNode) => {
    console.log('File selected via tree:', node.name, 'ID:', node.id);
    if (node.type === 'file') {
      setActiveTabId(node.id);
      if (!openTabs.find(tab => tab.id === node.id)) {
        setOpenTabs(prevTabs => [...prevTabs, { id: node.id, title: node.name }]);
      }
      loadFileContent(node.id);
    }
  }, [openTabs, loadFileContent]);

  const handleTabSelect = useCallback((tabId: string) => {
    console.log('Tab selected:', tabId);
    setActiveTabId(tabId);
    loadFileContent(tabId);
  }, [loadFileContent]);

  const handleTabClose = useCallback((tabId: string) => {
    console.log('Tab close requested:', tabId);
    setOpenTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      if (openTabs.length > 1) {
        // Find the new active tab (e.g., the one before the closed one, or the first one)
        const remainingTabs = openTabs.filter(tab => tab.id !== tabId);
        const newActiveTabId = remainingTabs[remainingTabs.length - 1]?.id || null;
        setActiveTabId(newActiveTabId);
        if (newActiveTabId) {
          loadFileContent(newActiveTabId);
        } else {
          setSelectedFileContent(null);
          setCurrentPathSegments([]);
        }
      } else {
        setActiveTabId(null);
        setSelectedFileContent(null);
        setCurrentPathSegments([]);
      }
    }
  }, [activeTabId, openTabs, loadFileContent]);

  const handleCopyCode = useCallback(() => {
    if (selectedFileContent) {
      navigator.clipboard.writeText(selectedFileContent)
        .then(() => {
          const activeTab = openTabs.find(tab => tab.id === activeTabId);
          sonnerToast.success(`${activeTab ? activeTab.title : 'File'} content copied to clipboard!`);
          console.log('Content copied for:', activeTab?.title);
        })
        .catch(err => {
          sonnerToast.error('Failed to copy content.');
          setError('Failed to copy content to clipboard.');
          console.error('Failed to copy content:', err);
        });
    } else {
      sonnerToast.warning('No content to copy.');
    }
  }, [selectedFileContent, activeTabId, openTabs]);
  
  // Effect to load a default file on initial mount, e.g., README.md
  useEffect(() => {
    const defaultFileId = 'README.md';
    const defaultFileNode = findNodeById(initialFileTree, defaultFileId);
    if (defaultFileNode && defaultFileNode.type === 'file') {
        handleFileSelect(defaultFileNode);
    } else if (initialFileTree.length > 0) {
        // Try to find the first file in the tree
        const findFirstFile = (nodes: FileNode[]): FileNode | null => {
            for (const node of nodes) {
                if (node.type === 'file') return node;
                if (node.children) {
                    const found = findFirstFile(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const firstFile = findFirstFile(initialFileTree);
        if (firstFile) {
            handleFileSelect(firstFile);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Optional: Main Header for the page itself */}
      {/* <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">Code Preview</h1>
      </header> */}
      
      <Resizable direction="horizontal" className="flex-grow border-t">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="h-full">
          <ScrollArea className="h-full p-2">
            <p className="p-2 text-sm font-semibold">Project Files</p>
            <FileTreeNavigator nodes={fileTree} onFileSelect={handleFileSelect} />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80} minSize={60} className="h-full">
          <div className="flex flex-col h-full">
            {activeTabId && (
              <>
                <div className="px-4 py-2 border-b bg-muted/40">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#"> {/* Could link to a project root */}
                          Project Root
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {currentPathSegments.map((segment, index) => (
                        <React.Fragment key={segment + index}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {index === currentPathSegments.length - 1 ? (
                              <BreadcrumbPage>{segment}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink href="#">{segment}</BreadcrumbLink> // Could make these interactive later
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <TabbedCodeEditorHeader
                  tabs={openTabs}
                  activeTabId={activeTabId}
                  onTabSelect={handleTabSelect}
                  onTabClose={handleTabClose}
                  className="border-b"
                />
              </>
            )}
            <div className="flex-grow relative">
              {error && (
                <div className="absolute top-4 right-4 z-10 w-1/2">
                    <Alert variant="destructive">
                      <TriangleAlert className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
              )}
              {activeTabId ? (
                <SyntaxHighlighterView
                  code={selectedFileContent}
                  fileName={openTabs.find(tab => tab.id === activeTabId)?.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileCode size={48} className="mb-4" />
                  <p>Select a file from the navigator to view its content.</p>
                  <p className="text-sm">Or, if you have recently closed all tabs, pick a new one.</p>
                </div>
              )}
            </div>
            {activeTabId && (
              <div className="p-3 border-t bg-muted/40 flex justify-end">
                <Button onClick={handleCopyCode} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </div>
            )}
          </div>
        </ResizablePanel>
      </Resizable>
    </div>
  );
};

export default CodePreviewPage;