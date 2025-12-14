import { useState } from 'react';
import { 
  PanelLeft, 
  Plus, 
  Search, 
  Clock, 
  Settings, 
  ChevronDown,
  MoreHorizontal,
  FolderOpen,
  User,
  PenSquare,
  Globe,
  MessageSquare,
  Zap,
  Sliders,
  HelpCircle,
  LogOut,
  ChevronRight,
  Upload,
  Edit3,
  Trash2,
  Users,
  Archive,
  MoreVertical
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { ProjectSection } from './ProjectSection';
import { Project } from '../types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SidebarProps {
  projects: Project[];
  activeConversationId: string | null;
  activeProjectId: string | null;
  onSelectConversation: (id: string) => void;
  onSelectProject: (id: string) => void;
  onToggleProject: (id: string) => void;
  onNewProject: () => void;
  onApiKeySettings: () => void;
  onModelSettings: () => void;
  onLibrary: () => void;
  onRenameConversation?: (conversationId: string) => void;
  onRenameProject?: (projectId: string) => void;
  onExportProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapsedToggle: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function Sidebar({
  projects,
  activeConversationId,
  activeProjectId,
  onSelectConversation,
  onSelectProject,
  onToggleProject,
  onNewProject,
  onApiKeySettings,
  onModelSettings,
  onLibrary,
  onRenameConversation,
  onRenameProject,
  onExportProject,
  onDeleteProject,
  onDeleteConversation,
  isOpen,
  onToggle,
  isCollapsed,
  onCollapsedToggle,
  isLoggedIn,
  onLogin,
  onLogout
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebarButton, setShowSidebarButton] = useState(false);

  const filteredProjects = searchQuery 
    ? projects.map(project => ({
        ...project,
        conversations: project.conversations.filter(conv =>
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(project => project.conversations.length > 0)
    : projects;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${isCollapsed ? 'w-16' : 'w-72'} 
          bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header */}
          {isCollapsed ? (
            <div className="flex items-center justify-center p-3">
              <button 
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                onMouseEnter={() => setShowSidebarButton(true)}
                onMouseLeave={() => setShowSidebarButton(false)}
                onClick={onCollapsedToggle}
              >
                {showSidebarButton ? (
                  <PanelLeft className="size-5 text-gray-700" />
                ) : (
                  <div className="size-5 rounded bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                    <MessageSquare className="size-3 text-white" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                <Settings className="size-5 text-cyan-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer" onClick={onCollapsedToggle}>
                <PanelLeft className="size-5 text-cyan-600" />
              </button>
            </div>
          )}

          {isCollapsed ? (
            /* Collapsed View - Icons Only */
            <>
              <div className="flex-1 flex flex-col items-center py-3 space-y-2 overflow-auto">
                <button 
                  onClick={onNewProject}
                  className="p-3 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  <PenSquare className="size-5 text-cyan-600" />
                </button>
                <button 
                  className="p-3 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Search className="size-5 text-cyan-600" />
                </button>
                <button 
                  onClick={onLibrary}
                  className="p-3 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Globe className="size-5 text-cyan-600" />
                </button>
              </div>

              {/* User Profile - Collapsed */}
              <div className="p-3 border-t border-gray-200">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                      <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                        <span className="text-white text-sm">{isLoggedIn ? 'CS' : '?'}</span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="end" className="w-64 p-0">
                    <UserMenu isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            /* Expanded View */
            <>
              <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
                <div className="px-3 py-3 space-y-6">
                  {/* Actions */}
                  <div className="space-y-2 w-full">
                    <button 
                      onClick={onNewProject}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="size-4 flex-shrink-0" />
                      <span className="text-sm truncate min-w-0">새 프로젝트</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors cursor-pointer">
                      <Search className="size-4 flex-shrink-0" />
                      <span className="text-sm truncate min-w-0">채팅 검색</span>
                    </button>

                    <button 
                      onClick={onLibrary}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Clock className="size-4 flex-shrink-0" />
                      <span className="text-sm truncate min-w-0">라이브러리</span>
                    </button>

                    <button 
                      onClick={onApiKeySettings}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Settings className="size-4 flex-shrink-0" />
                      <span className="text-sm truncate min-w-0">API 키 설정</span>
                    </button>

                    <button 
                      onClick={onModelSettings}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Sliders className="size-4 flex-shrink-0" />
                      <span className="text-sm truncate min-w-0">모델 설정</span>
                    </button>
                  </div>

                  {/* Projects with Conversations */}
                  <div className="w-full">
                    <div className="text-xs text-gray-500 px-2 mb-2">프로젝트</div>
                    <div className="space-y-1 w-full">
                      {filteredProjects.map((project) => (
                        <ProjectSection
                          key={project.id}
                          project={project}
                          activeConversationId={activeConversationId}
                          activeProjectId={activeProjectId}
                          onSelectConversation={onSelectConversation}
                          onSelectProject={onSelectProject}
                          onToggleProject={onToggleProject}
                          onRenameConversation={onRenameConversation}
                          onRenameProject={onRenameProject}
                          onExportProject={onExportProject}
                          onDeleteProject={onDeleteProject}
                          onDeleteConversation={onDeleteConversation}
                          isExpanded={project.isExpanded ?? true}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Profile - Expanded */}
              <div className="p-3 border-t border-gray-200">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                      <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">{isLoggedIn ? 'CS' : '?'}</span>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm truncate">{isLoggedIn ? 'CS Simulator' : '비회원'}</p>
                        <p className="text-xs text-gray-500 truncate">{isLoggedIn ? 'Free Plan' : '임시 사용 중'}</p>
                      </div>
                      <MoreHorizontal className="size-4 text-gray-500 flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-64 p-0">
                    <UserMenu isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function UserMenu({ isLoggedIn, onLogin, onLogout }: { isLoggedIn: boolean; onLogin: () => void; onLogout: () => void }) {
  if (!isLoggedIn) {
    return (
      <div className="py-2">
        {/* Guest Info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
              <span className="text-white">?</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate">비회원 모드</p>
              <p className="text-xs text-gray-500 truncate">로그인하고 저장하세요</p>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="p-4">
          <button 
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-2 px-4 rounded-lg transition-all cursor-pointer"
          >
            로그인 / 회원가입
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            ⚠️ 비회원은 탭을 닫으면 모든 데이터가 삭제됩니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <span className="text-white">CS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate">CS Simulator</p>
            <p className="text-xs text-gray-500 truncate">@cssimulator</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
          <Zap className="size-4" />
          <span className="text-sm">플랜 업그레이드</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
          <Sliders className="size-4" />
          <span className="text-sm">개인 맞춤 설정</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
          <Settings className="size-4" />
          <span className="text-sm">설정</span>
        </button>
      </div>

      <div className="border-t border-gray-200 py-2">
        <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <HelpCircle className="size-4" />
            <span className="text-sm">도움말</span>
          </div>
          <ChevronRight className="size-4 text-gray-400" />
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
          <span className="text-sm">로그아웃</span>
        </button>
      </div>
    </div>
  );
}