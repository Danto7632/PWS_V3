import { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Share2, 
  MoreHorizontal, 
  Plus,
  Mic,
  Volume2,
  Send,
  FolderOpen,
  MessageSquarePlus,
  Settings,
  FileText,
  Trash2,
  MoreVertical,
  Upload,
  Edit3,
  Sliders
} from 'lucide-react';
import { Button } from './ui/button';
import { ModelSelector } from './ModelSelector';
import { ProjectMenu } from './ProjectMenu';
import { ApiKeySettings } from './ApiKeySettings';
import { AddFileDialog } from './AddFileDialog';
import { GuidelineDialog } from './GuidelineDialog';
import { Message, Conversation, ProjectFile } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ChatAreaProps {
  projectTitle?: string;
  projectConversations?: Array<{
    id: string;
    title: string;
    preview: string;
    date: string;
    projectId: string;
    role?: 'customer' | 'employee';
  }>;
  activeConversation?: Conversation;
  onAddConversation: () => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onSendMessage: (message: string) => void;
  onToggleSidebar: () => void;
  onSelectConversation: (id: string) => void;
  onAddFiles: (files: Array<{ name: string; size: number; type: string }>) => void;
  onDeleteProject?: () => void;
  onDeleteConversation?: (conversationId: string) => void;
  apiKeys: { gpt: string; gemini: string; claude: string; perplexity: string; ollama: string };
  onSaveApiKeys: (keys: { gpt: string; gemini: string; claude: string; perplexity: string; ollama: string }) => void;
  isApiKeySettingsOpen: boolean;
  onApiKeySettingsOpenChange: (open: boolean) => void;
  isLoggedIn: boolean;
  enabledModels: string[];
  projectFiles?: ProjectFile[];
}

export function ChatArea({
  projectTitle,
  projectConversations,
  activeConversation,
  onAddConversation,
  selectedModel,
  onModelChange,
  onSendMessage,
  onToggleSidebar,
  onSelectConversation,
  isApiKeySettingsOpen,
  onApiKeySettingsOpenChange,
  apiKeys,
  onSaveApiKeys,
  projectFiles = [],
  onAddFiles,
  onDeleteProject,
  onDeleteConversation,
  isLoggedIn,
  enabledModels
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
  const [isGuidelineDialogOpen, setIsGuidelineDialogOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const sendMessage = () => {
    if (inputValue.trim() && activeConversation) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white overflow-hidden">
      {/* Header - Only show when no project is selected */}
      {!projectTitle && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button 
              onClick={onToggleSidebar}
              className="p-2 lg:hidden hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="size-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg">
                {activeConversation?.title || 'CS 업무 시뮬레이터'}
              </h1>
              <p className="text-xs text-gray-500">AI 기반 고객 서비스 교육 도구</p>
            </div>
          </div>
          <ModelSelector 
            selectedModel={selectedModel}
            onSelectModel={onModelChange}
            enabledModels={enabledModels}
          />
        </div>
      )}

      {/* API Key Settings Modal */}
      <ApiKeySettings
        isOpen={isApiKeySettingsOpen}
        onClose={() => onApiKeySettingsOpenChange(false)}
        apiKeys={apiKeys}
        onSaveApiKeys={onSaveApiKeys}
      />

      {/* Add File Dialog */}
      <AddFileDialog
        isOpen={isAddFileDialogOpen}
        onClose={() => setIsAddFileDialogOpen(false)}
        onAddFiles={(files) => onAddFiles?.(files)}
        existingFiles={projectFiles}
      />

      {/* Guideline Dialog */}
      <GuidelineDialog
        isOpen={isGuidelineDialogOpen}
        onClose={() => setIsGuidelineDialogOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Project View - Show conversations list */}
          {projectTitle && (
            <>
              {/* Project Header */}
              <div className="max-w-3xl mx-auto py-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="size-8 text-gray-700" />
                    <h1 className="text-4xl">{projectTitle}</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={onAddConversation}
                    >
                      <MessageSquarePlus className="size-4" />
                      대화 추가
                    </Button>
                    
                    <DropdownMenu open={isProjectMenuOpen} onOpenChange={setIsProjectMenuOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => {
                          setIsGuidelineDialogOpen(true);
                          setIsProjectMenuOpen(false);
                        }}>
                          <Sliders className="mr-2 size-4" />
                          프로젝트 설정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setIsAddFileDialogOpen(true);
                          setIsProjectMenuOpen(false);
                        }}>
                          <FileText className="mr-2 size-4" />
                          지침 추가
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onDeleteProject && (
                          <DropdownMenuItem 
                            onClick={() => {
                              onDeleteProject();
                              setIsProjectMenuOpen(false);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 size-4" />
                            프로젝트 삭제
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Conversations List */}
                {projectConversations && projectConversations.length > 0 ? (
                  <div className="space-y-2">
                    <h2 className="text-sm text-gray-500 mb-4">대화</h2>
                    {projectConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="relative group"
                      >
                        <button
                          onClick={() => onSelectConversation?.(conversation.id)}
                          className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <h3 className="mb-1">{conversation.title}</h3>
                          <p className="text-sm text-gray-500">{conversation.preview}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-gray-400">{conversation.date}</p>
                            {conversation.role && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${ 
                                conversation.role === 'customer' 
                                  ? 'bg-cyan-100 text-cyan-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {conversation.role === 'customer' ? '고객' : '직원'}
                              </span>
                            )}
                          </div>
                        </button>
                        {onDeleteConversation && (
                          <button
                            className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <MessageSquarePlus className="size-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">아직 대화가 없습니다</p>
                    <Button 
                      onClick={onAddConversation}
                      className="gap-2"
                    >
                      <MessageSquarePlus className="size-4" />
                      첫 대화 시작하기
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Conversation View - Show messages */}
          {!projectTitle && activeConversation && (
            <>
              {(!activeConversation.messages || activeConversation.messages.length === 0) ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <FolderOpen className="size-16 mx-auto text-gray-300" />
                  </div>
                  <h1 className="text-3xl mb-4">{activeConversation.title || '새 프로젝트'}</h1>
                  <p className="text-gray-500 mb-8">
                    {activeConversation.title ? `${activeConversation.title}에서 새 채팅` : '프로젝트를 선택하거나 새로 만드세요'}
                  </p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6 py-4">
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex-shrink-0 flex items-center justify-center shadow-sm">
                          <span className="text-white text-sm">AI</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="size-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0 flex items-center justify-center shadow-sm">
                          <span className="text-white text-sm">U</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input Area - Only show for conversation view */}
      {!projectTitle && activeConversation && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-200 transition-all">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                >
                  <Plus className="size-5 text-gray-600" />
                </button>
                
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeConversation.title ? `${activeConversation.title}에서 새 채팅` : '메시지를 입력하세요'}
                  className="flex-1 bg-transparent resize-none outline-none max-h-32 min-h-[24px] py-2"
                  rows={1}
                />

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Mic className="size-5 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Volume2 className="size-5 text-gray-600" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="size-5 text-white" />
                  </button>
                </div>
              </div>
            </form>
            <p className="text-xs text-gray-500 text-center mt-3">
              CS 업무 시뮬레이터 - 전문적인 고객 서비스 교육 위한 도구
              {!isLoggedIn && (
                <span className="block text-amber-600 mt-1">
                  ⚠️ 비회원 모드: 탭을 닫으면 대화가 제됩니다
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}