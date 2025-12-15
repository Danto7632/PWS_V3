import { MessageSquare, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { Conversation } from '../types';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onRename?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
}

export function ConversationItem({ conversation, isActive, onClick, onRename, onDelete }: ConversationItemProps) {
  const [open, setOpen] = useState(false);

  const handleRename = () => {
    setOpen(false);
    setTimeout(() => {
      onRename?.(conversation.id);
    }, 100);
  };

  const handleDelete = () => {
    setOpen(false);
    setTimeout(() => {
      onDelete?.(conversation.id);
    }, 100);
  };

  return (
    <div className="relative group w-full">
      <button
        onClick={onClick}
        className={`
          w-full flex items-start gap-2 p-2 pr-8 rounded-lg transition-colors text-left cursor-pointer
          ${isActive ? 'bg-cyan-100' : 'group-hover:bg-gray-100'}
        `}
      >
        <MessageSquare className={`size-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-cyan-600' : 'text-gray-500'}`} />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className={`text-sm truncate ${isActive ? 'text-cyan-700' : ''}`}>{conversation.title}</div>
        </div>
      </button>
      
      {/* Menu Button - GPT 스타일 */}
      <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
            {onRename && (
              <DropdownMenuItem onClick={handleRename}>
                <Edit3 className="mr-2 size-4" />
                이름 바꾸기
              </DropdownMenuItem>
            )}
            {onDelete && (
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
  );
}