import { FolderOpen, Folder, MoreVertical, Upload, Edit3, Trash2 } from 'lucide-react';
import { Project } from '../types';
import { ConversationItem } from './ConversationItem';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ProjectSectionProps {
  project: Project;
  activeConversationId: string | null;
  activeProjectId: string | null;
  onSelectConversation: (id: string) => void;
  onSelectProject: (id: string) => void;
  onToggleProject: (id: string) => void;
  onRenameConversation?: (conversationId: string) => void;
  onRenameProject?: (projectId: string) => void;
  onExportProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  isExpanded: boolean;
}

export function ProjectSection({ 
  project, 
  activeConversationId, 
  activeProjectId,
  onSelectConversation,
  onSelectProject,
  onToggleProject,
  onRenameConversation,
  onRenameProject,
  onExportProject,
  onDeleteProject,
  onDeleteConversation,
  isExpanded
}: ProjectSectionProps) {
  const [open, setOpen] = useState(false);
  const [isFolderHovered, setIsFolderHovered] = useState(false);
  const isProjectActive = activeProjectId === project.id && !activeConversationId;

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFolderIcon = target.closest('[data-folder-icon]');
    
    if (isFolderIcon) {
      onToggleProject(project.id);
    } else {
      onSelectProject(project.id);
    }
  };

  const handleExport = () => {
    setOpen(false);
    setTimeout(() => {
      onExportProject?.(project.id);
    }, 100);
  };

  const handleRename = () => {
    setOpen(false);
    setTimeout(() => {
      onRenameProject?.(project.id);
    }, 100);
  };

  const handleDelete = () => {
    setOpen(false);
    setTimeout(() => {
      onDeleteProject?.(project.id);
    }, 100);
  };

  return (
    <div className="w-full">
      {/* Project Header */}
      <div className="relative group w-full">
        <button 
          onClick={handleClick}
          className={`w-full flex items-center gap-2 px-2 py-2 pr-8 rounded-lg transition-colors text-left cursor-pointer ${
            isProjectActive ? 'bg-cyan-50 text-cyan-700' : 'group-hover:bg-gray-100'
          }`}
        >
          <div 
            data-folder-icon 
            className="flex-shrink-0 p-0.5 relative group/folder"
            onMouseEnter={() => setIsFolderHovered(true)}
            onMouseLeave={() => setIsFolderHovered(false)}
          >
            {(isExpanded || isFolderHovered) ? (
              <FolderOpen className={`size-4 ${isProjectActive ? 'text-cyan-600' : 'text-gray-600'}`} />
            ) : (
              <Folder className={`size-4 ${isProjectActive ? 'text-cyan-600' : 'text-gray-600'}`} />
            )}
          </div>
          <span className="text-sm flex-1 truncate min-w-0 overflow-hidden">{project.name}</span>
          <span className={`text-xs flex-shrink-0 ${isProjectActive ? 'text-cyan-600' : 'text-gray-400'}`}>{project.conversations.length}</span>
        </button>
        
        {/* Menu Button - GPT 스타일 */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1 rounded transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onExportProject && (
                <DropdownMenuItem onClick={handleExport}>
                  <Upload className="mr-2 size-4" />
                  내보내기
                </DropdownMenuItem>
              )}
              {onRenameProject && (
                <DropdownMenuItem onClick={handleRename}>
                  <Edit3 className="mr-2 size-4" />
                  이름 바꾸기
                </DropdownMenuItem>
              )}
              {onDeleteProject && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 size-4" />
                    삭제
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Conversations List */}
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {project.conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation(conversation.id)}
              onRename={onRenameConversation}
              onDelete={onDeleteConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
}