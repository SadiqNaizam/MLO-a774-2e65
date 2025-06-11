import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react'; // For close tab icon

export interface TabInfo {
  id: string; // Typically the file path or a unique identifier
  title: string; // Typically the file name
}

interface TabbedCodeEditorHeaderProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose?: (tabId: string) => void; // Optional: if tabs can be closed
  className?: string;
}

const TabbedCodeEditorHeader: React.FC<TabbedCodeEditorHeaderProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  className = '',
}) => {
  console.log("Rendering TabbedCodeEditorHeader, activeTabId:", activeTabId, "tabs:", tabs.length);

  if (!tabs || tabs.length === 0) {
    // return <div className={`p-2 text-sm text-gray-400 ${className}`}>No files open.</div>;
    return null; // Or some placeholder, depending on desired UI when no tabs
  }

  return (
    <div className={`flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${className}`}>
      <div role="tablist" className="flex space-x-1 p-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTabId}
            data-state={tab.id === activeTabId ? 'active' : 'inactive'}
            className={`flex items-center pl-3 pr-1 py-1.5 text-sm font-medium rounded-t-md cursor-pointer transition-colors
                        border-b-2
                        ${tab.id === activeTabId
                          ? 'bg-gray-100 dark:bg-gray-800 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
            onClick={() => {
              console.log("Tab selected:", tab.title);
              onTabSelect(tab.id);
            }}
          >
            <span>{tab.title}</span>
            {onTabClose && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-1.5 h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent tab selection when clicking close
                  console.log("Tab close clicked:", tab.title);
                  onTabClose(tab.id);
                }}
                aria-label={`Close tab ${tab.title}`}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabbedCodeEditorHeader;