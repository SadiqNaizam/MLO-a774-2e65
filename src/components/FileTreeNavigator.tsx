import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui Button for consistency if needed

export interface FileNode {
  id: string; // Unique path or identifier
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeNavigatorProps {
  nodes: FileNode[];
  onFileSelect: (node: FileNode) => void;
  // selectedFileId?: string | null; // To highlight the selected file
}

const TreeNode: React.FC<{
  node: FileNode;
  onFileSelect: (node: FileNode) => void;
  // selectedFileId?: string | null;
  level: number;
}> = ({ node, onFileSelect, /*selectedFileId,*/ level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
      console.log(`Toggled folder: ${node.name}, isOpen: ${!isOpen}`);
    }
  };

  const handleSelect = () => {
    console.log(`Selected node: ${node.name}, type: ${node.type}`);
    if (node.type === 'file') {
      onFileSelect(node);
    } else {
      // Optionally, selecting a folder could also trigger an action or just toggle
      handleToggle();
    }
  };

  // const isSelected = selectedFileId === node.id;

  return (
    <div style={{ paddingLeft: `${level * 20}px` }}>
      <div
        className={`flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800`}
        // ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
        onClick={isFolder ? handleToggle : handleSelect}
      >
        {isFolder && (
          isOpen ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />
        )}
        {isFolder ? <Folder size={16} className="mr-2 text-yellow-500" /> : <FileText size={16} className="mr-2 text-blue-500" />}
        <span className="text-sm">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((childNode) => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              onFileSelect={onFileSelect}
              // selectedFileId={selectedFileId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTreeNavigator: React.FC<FileTreeNavigatorProps> = ({ nodes, onFileSelect/*, selectedFileId*/ }) => {
  console.log("Rendering FileTreeNavigator with nodes:", nodes.length);

  if (!nodes || nodes.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No files or folders to display.</div>;
  }

  return (
    <div className="w-full h-full overflow-y-auto p-2 space-y-0.5">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onFileSelect={onFileSelect}
          // selectedFileId={selectedFileId}
          level={0}
        />
      ))}
    </div>
  );
};

export default FileTreeNavigator;