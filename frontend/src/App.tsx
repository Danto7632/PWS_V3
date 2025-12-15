import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { NewProjectDialog } from './components/NewProjectDialog';
import { ProjectSetupDialog } from './components/ProjectSetupDialog';
import { AddConversationDialog } from './components/AddConversationDialog';
import { AuthDialog } from './components/AuthDialog';
import { ModelSettings } from './components/ModelSettings';
import { RenameDialog } from './components/RenameDialog';
import { ExportDialog } from './components/ExportDialog';
import { LibraryPage } from './components/LibraryPage';
import { ApiKeySettings } from './components/ApiKeySettings';
import { Project, Message, ProjectFile } from './types';
import apiService, { ApiProject, tokenManager } from './services/api';

// API 프로젝트를 프론트엔드 형식으로 변환
const transformApiProject = (apiProject: ApiProject): Project => ({
  id: apiProject.id,
  name: apiProject.name,
  category: apiProject.category,
  guidelines: apiProject.guidelines,
  uploadPercentage: apiProject.uploadPercentage || 100,
  isExpanded: apiProject.isExpanded,
  conversations: apiProject.conversations?.map(conv => ({
    id: conv.id,
    title: conv.title,
    preview: conv.preview || '',
    date: new Date(conv.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
    projectId: conv.projectId,
    role: conv.role,
    messages: conv.messages?.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    })) || []
  })) || [],
  files: apiProject.files?.map(file => ({
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size
  })) || []
});

// 기본 설정값
const DEFAULT_API_KEYS = { 
  gpt: '', 
  gemini: '',
  claude: '',
  perplexity: '',
  ollama: 'http://localhost:11434'
};

const DEFAULT_ENABLED_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'claude-3.5-sonnet',
  'claude-3-opus',
  'perplexity-sonar-pro',
  'ollama-llama3.3'
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectsState, setProjectsState] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [apiKeys, setApiKeys] = useState(DEFAULT_API_KEYS);
  const [isApiKeySettingsOpen, setIsApiKeySettingsOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isProjectSetupDialogOpen, setIsProjectSetupDialogOpen] = useState(false);
  const [isAddConversationDialogOpen, setIsAddConversationDialogOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [enabledModels, setEnabledModels] = useState<string[]>(DEFAULT_ENABLED_MODELS);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  // 로그인 상태 확인
  const isLoggedIn = !!currentUser;

  // Rename & Export states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ type: 'project' | 'conversation'; id: string; currentName: string } | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportProject, setExportProject] = useState<Project | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  // 로컬 ID 생성 헬퍼 (비회원용)
  const generateLocalId = () => `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 프로젝트 데이터 로드 (회원만)
  const loadProjects = useCallback(async () => {
    if (!isLoggedIn) {
      // 비회원은 빈 상태로 시작
      setProjectsState([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const apiProjects = await apiService.getProjects();
      const projects = apiProjects.map(transformApiProject);
      setProjectsState(projects);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // 초기 로드 시 저장된 토큰 확인
  useEffect(() => {
    const user = tokenManager.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // 사용자 변경 시 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) {
        // 비로그인 상태: 기본값 사용
        setApiKeys(DEFAULT_API_KEYS);
        setEnabledModels(DEFAULT_ENABLED_MODELS);
        setSelectedModel('gpt-4o');
        return;
      }
      
      try {
        // 로그인 상태: DB에서 설정 로드
        const settings = await apiService.getSettings();
        setApiKeys(settings.apiKeys);
        setEnabledModels(settings.enabledModels);
        setSelectedModel(settings.selectedModel);
      } catch (error) {
        console.error('사용자 설정 로드 실패:', error);
        // 실패 시 기본값 사용
        setApiKeys(DEFAULT_API_KEYS);
        setEnabledModels(DEFAULT_ENABLED_MODELS);
        setSelectedModel('gpt-4o');
      }
    };
    
    loadSettings();
  }, [currentUser]);

  // 로그인/로그아웃 시 프로젝트 다시 로드
  useEffect(() => {
    loadProjects();
  }, [currentUser, loadProjects]);

  // 로그인 핸들러
  const handleLogin = async (user: { id: string; email: string; name: string }) => {
    setCurrentUser(user);
    // 비회원으로 작업하던 프로젝트가 있으면 이전 여부 확인
    const guestProjects = projectsState.filter(p => !p.userId);
    if (guestProjects.length > 0) {
      const migrate = window.confirm(
        `비회원으로 작업하던 ${guestProjects.length}개의 프로젝트가 있습니다. 로그인한 계정으로 이전하시겠습니까?`
      );
      if (migrate) {
        try {
          await apiService.migrateProjectsToUser(guestProjects.map(p => p.id));
        } catch (error) {
          console.error('프로젝트 이전 실패:', error);
        }
      }
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
    setCurrentUser(null);
    setActiveProjectId(null);
    setActiveConversationId(null);
    // 로그아웃 시 프로젝트 목록 초기화 - 다음 로그인 시 해당 사용자 데이터만 로드됨
    setProjectsState([]);
    // 설정 초기화
    setApiKeys(DEFAULT_API_KEYS);
    setEnabledModels(DEFAULT_ENABLED_MODELS);
    setSelectedModel('gpt-4o');
  };

  // Find active conversation across all projects
  const findActiveConversation = () => {
    for (const project of projectsState) {
      const conv = project.conversations.find(c => c.id === activeConversationId);
      if (conv) {
        // 대화에 projectId가 없으면 프로젝트 ID를 추가
        if (!conv.projectId) {
          return { ...conv, projectId: project.id };
        }
        return conv;
      }
    }
    return null;
  };

  // Find active project
  const findActiveProject = () => {
    return projectsState.find(p => p.id === activeProjectId);
  };

  const activeConversation = findActiveConversation();
  const activeProject = findActiveProject();

  // 타이핑 애니메이션 상태
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState<string>('');

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId || isSendingMessage) return;

    const conversation = findActiveConversation();
    if (!conversation) return;

    const userMessage: Message = {
      id: generateLocalId(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    // 낙관적 업데이트: 사용자 메시지 먼저 표시
    setProjectsState(prev => prev.map(project => ({
      ...project,
      conversations: project.conversations.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...(conv.messages || []), userMessage] }
          : conv
      )
    })));

    setIsSendingMessage(true);

    // 로딩 메시지 추가
    const loadingMessageId = generateLocalId();
    const loadingMessage: Message = {
      id: loadingMessageId,
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      isLoading: true
    };
    
    setProjectsState(prev => prev.map(project => ({
      ...project,
      conversations: project.conversations.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...(conv.messages || []), loadingMessage] }
          : conv
      )
    })));

    try {
      // 회원만 사용자 메시지 서버에 저장
      if (isLoggedIn) {
        const savedUserMessage = await apiService.createMessage({
          role: 'user',
          content,
          conversationId: activeConversationId
        });

        // 메시지 ID 업데이트
        setProjectsState(prev => prev.map(project => ({
          ...project,
          conversations: project.conversations.map(conv =>
            conv.id === activeConversationId
              ? { 
                  ...conv, 
                  messages: conv.messages?.map(msg => 
                    msg.id === userMessage.id 
                      ? { ...msg, id: savedUserMessage.id }
                      : msg
                  ) || []
                }
              : conv
          )
        })));
      }

      // 프로젝트의 지침 가져오기
      const project = projectsState.find(p => p.id === conversation.projectId);
      const guidelines = project?.guidelines || '';

      // 대화 히스토리 준비 (로딩 메시지와 현재 메시지 제외)
      const conversationHistory = conversation.messages
        ?.filter(msg => !msg.isLoading && msg.id !== userMessage.id)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        })) || [];

      // AI 응답 요청 (비회원도 가능)
      console.log('Chat request - projectId:', conversation.projectId, 'userId:', currentUser?.id);
      const aiResponse = await apiService.chat({
        message: content,
        projectId: conversation.projectId,
        conversationId: activeConversationId,
        role: conversation.role || 'customer',
        modelId: selectedModel,
        apiKeys,
        guidelines,
        conversationHistory,
        userId: currentUser?.id
      });

      const aiMessageId = generateLocalId();
      const fullContent = aiResponse.response;

      // 로딩 메시지를 실제 메시지로 교체 (타이핑 시작)
      setTypingMessageId(aiMessageId);
      setDisplayedContent('');

      setProjectsState(prev => prev.map(project => ({
        ...project,
        conversations: project.conversations.map(conv =>
          conv.id === activeConversationId
            ? { 
                ...conv, 
                messages: conv.messages?.map(msg => 
                  msg.id === loadingMessageId 
                    ? { ...msg, id: aiMessageId, content: '', isLoading: false, isTyping: true, fullContent }
                    : msg
                ) || []
              }
            : conv
        )
      })));

      // 타이핑 애니메이션
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        currentIndex += 1;
        const newContent = fullContent.slice(0, currentIndex);
        
        setProjectsState(prev => prev.map(project => ({
          ...project,
          conversations: project.conversations.map(conv =>
            conv.id === activeConversationId
              ? { 
                  ...conv, 
                  messages: conv.messages?.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: newContent }
                      : msg
                  ) || []
                }
              : conv
          )
        })));

        if (currentIndex >= fullContent.length) {
          clearInterval(typingInterval);
          setTypingMessageId(null);
          
          // 타이핑 완료 후 최종 상태 업데이트
          setProjectsState(prev => prev.map(project => ({
            ...project,
            conversations: project.conversations.map(conv =>
              conv.id === activeConversationId
                ? { 
                    ...conv, 
                    messages: conv.messages?.map(msg => 
                      msg.id === aiMessageId 
                        ? { ...msg, isTyping: false }
                        : msg
                    ) || []
                  }
                : conv
            )
          })));

          // 회원만 AI 메시지 서버에 저장
          if (isLoggedIn) {
            apiService.createMessage({
              role: 'assistant',
              content: fullContent,
              conversationId: activeConversationId
            });
          }
        }
      }, 20); // 20ms마다 한 글자씩

      // 회원만 대화 미리보기 업데이트
      if (isLoggedIn) {
        await apiService.updateConversation(activeConversationId, {
          preview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
        });
      } else {
        // 비회원은 로컬에서만 미리보기 업데이트
        setProjectsState(prev => prev.map(project => ({
          ...project,
          conversations: project.conversations.map(conv =>
            conv.id === activeConversationId
              ? { ...conv, preview: content.substring(0, 50) + (content.length > 50 ? '...' : '') }
              : conv
          )
        })));
      }

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 실패 시 사용자 메시지 롤백
      setProjectsState(prev => prev.map(project => ({
        ...project,
        conversations: project.conversations.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: conv.messages?.filter(m => m.id !== userMessage.id) || [] }
            : conv
        )
      })));
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleNewProject = () => {
    setActiveConversationId(null);
    setActiveProjectId(null);
    setIsNewProjectDialogOpen(true);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setActiveProjectId(null);
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setActiveConversationId(null);
  };

  const handleDeleteProject = async () => {
    if (!activeProjectId) return;
    
    if (window.confirm('프로젝트를 삭제하시겠습니까? 모든 대화도 함께 삭제됩니다.')) {
      // 비회원: 로컬에서만 삭제
      if (!isLoggedIn) {
        setProjectsState(prev => prev.filter(p => p.id !== activeProjectId));
        setActiveProjectId(null);
        return;
      }

      // 회원: 서버에서도 삭제
      try {
        await apiService.deleteProject(activeProjectId);
        await apiService.deleteProjectFiles(activeProjectId);
        setProjectsState(prev => prev.filter(p => p.id !== activeProjectId));
        setActiveProjectId(null);
      } catch (error) {
        console.error('프로젝트 삭제 실패:', error);
        alert('프로젝트 삭제에 실패했습니다.');
      }
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (window.confirm('이 대화를 삭제하시겠습니까?')) {
      // 비회원: 로컬에서만 삭제
      if (!isLoggedIn) {
        setProjectsState(prev => prev.map(project => ({
          ...project,
          conversations: project.conversations.filter(c => c.id !== conversationId)
        })));
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
        }
        return;
      }

      // 회원: 서버에서도 삭제
      try {
        await apiService.deleteConversation(conversationId);
        setProjectsState(prev => prev.map(project => ({
          ...project,
          conversations: project.conversations.filter(c => c.id !== conversationId)
        })));
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
        }
      } catch (error) {
        console.error('대화 삭제 실패:', error);
        alert('대화 삭제에 실패했습니다.');
      }
    }
  };

  const handleToggleProject = async (id: string) => {
    const project = projectsState.find(p => p.id === id);
    if (!project) return;

    const newIsExpanded = !project.isExpanded;
    
    setProjectsState(prev => prev.map(p => 
      p.id === id ? { ...p, isExpanded: newIsExpanded } : p
    ));

    // 회원만 서버에 저장
    if (isLoggedIn) {
      try {
        await apiService.updateProject(id, { isExpanded: newIsExpanded });
      } catch (error) {
        console.error('프로젝트 토글 실패:', error);
      }
    }
  };

  const handleCreateProject = async (name: string, category?: string) => {
    // 비회원: 로컬에서만 생성
    if (!isLoggedIn) {
      const newProject: Project = {
        id: generateLocalId(),
        name,
        category,
        isExpanded: true,
        conversations: [],
        files: []
      };
      setProjectsState(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setActiveConversationId(null);
      setIsNewProjectDialogOpen(false);
      setIsProjectSetupDialogOpen(true);
      return;
    }

    // 회원: 서버에 저장
    try {
      const apiProject = await apiService.createProject({ name, category });
      const newProject = transformApiProject(apiProject);
      
      setProjectsState(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setActiveConversationId(null);
      setIsNewProjectDialogOpen(false);
      setIsProjectSetupDialogOpen(true);
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
    }
  };

  const handleProjectSetupComplete = async (files: ProjectFile[], guidelines: string, uploadPercentage: number, actualFiles?: File[]) => {
    // 프로젝트 ID 결정: activeProjectId 또는 현재 대화의 projectId
    const targetProjectId = activeProjectId || activeConversation?.projectId;
    console.log('File upload - targetProjectId:', targetProjectId, 'userId:', currentUser?.id);
    if (!targetProjectId) {
      console.error('프로젝트 ID가 없습니다!');
      return;
    }

    // 비회원: 로컬 상태만 업데이트 (파일 업로드도 시도)
    if (!isLoggedIn) {
      // 파일 학습 (비회원도 AI 서버에 업로드 가능, userId 없음)
      if (actualFiles && actualFiles.length > 0) {
        for (const file of actualFiles) {
          try {
            await apiService.uploadFile(file, targetProjectId, uploadPercentage);
          } catch (error) {
            console.error('파일 업로드 실패:', error);
          }
        }
      }
      
      setProjectsState(prev => prev.map(project =>
        project.id === targetProjectId
          ? { ...project, files, guidelines, uploadPercentage }
          : project
      ));
      return;
    }

    try {
      // 파일 학습 (회원은 userId 포함) + DB에 파일 정보 저장
      if (actualFiles && actualFiles.length > 0) {
        for (const file of actualFiles) {
          // AI 서버에 임베딩
          const uploadResult = await apiService.uploadFile(file, targetProjectId, uploadPercentage, currentUser?.id);
          
          // 백엔드 DB에 파일 레코드 저장
          await apiService.createFileRecord({
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            projectId: targetProjectId,
            embeddingFileId: uploadResult.file_id
          });
        }
      }
      
      // 가이드라인 및 업로드 퍼센트 업데이트
      await apiService.updateProject(targetProjectId, { guidelines, uploadPercentage });

      // 프로젝트 다시 로드하여 최신 상태 반영
      const updatedProject = await apiService.getProject(targetProjectId);
      setProjectsState(prev => prev.map(project =>
        project.id === targetProjectId
          ? { 
              ...project, 
              files: updatedProject.files.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                size: f.size
              })),
              guidelines: updatedProject.guidelines || guidelines,
              uploadPercentage: updatedProject.uploadPercentage || uploadPercentage
            }
          : project
      ));
    } catch (error) {
      console.error('프로젝트 설정 완료 실패:', error);
      throw error; // 에러를 다시 던져서 Dialog에서 처리
    }
  };

  const handleAddConversation = (projectId?: string) => {
    const targetProjectId = projectId || activeProjectId;
    if (targetProjectId) {
      setPendingProjectId(targetProjectId);
      setIsAddConversationDialogOpen(true);
    }
  };

  const handleSelectRole = async (role: 'customer' | 'employee') => {
    if (!pendingProjectId) return;

    const title = `새 ${role === 'customer' ? '고객' : '직원'} 대화`;

    // 비회원: 로컬에서만 생성
    if (!isLoggedIn) {
      const newConversation = {
        id: generateLocalId(),
        title,
        preview: '새로운 대화를 시작하세요...',
        date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
        projectId: pendingProjectId,
        role,
        messages: []
      };

      setProjectsState(prev => prev.map(p =>
        p.id === pendingProjectId
          ? { ...p, conversations: [newConversation, ...p.conversations] }
          : p
      ));

      setActiveConversationId(newConversation.id);
      setActiveProjectId(null);
      setPendingProjectId(null);
      setIsAddConversationDialogOpen(false);
      return;
    }

    // 회원: 서버에 저장
    try {
      const apiConversation = await apiService.createConversation({
        title,
        preview: '새로운 대화를 시작하세요...',
        role,
        projectId: pendingProjectId
      });

      const newConversation = {
        id: apiConversation.id,
        title: apiConversation.title,
        preview: apiConversation.preview || '',
        date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
        projectId: pendingProjectId,
        role,
        messages: []
      };

      setProjectsState(prev => prev.map(p =>
        p.id === pendingProjectId
          ? { ...p, conversations: [newConversation, ...p.conversations] }
          : p
      ));

      setActiveConversationId(newConversation.id);
      setActiveProjectId(null);
      setPendingProjectId(null);
      setIsAddConversationDialogOpen(false);
    } catch (error) {
      console.error('대화 생성 실패:', error);
      alert('대화 생성에 실패했습니다.');
    }
  };

  const handleAddFiles = async (projectId: string, files: ProjectFile[]) => {
    // 비회원: 로컬 상태만 업데이트
    if (!isLoggedIn) {
      setProjectsState(prev => prev.map(project =>
        project.id === projectId
          ? { ...project, files: [...(project.files || []), ...files] }
          : project
      ));
      return;
    }

    try {
      // 파일 메타데이터 저장
      for (const file of files) {
        await apiService.createFileRecord({
          name: file.name,
          type: file.type,
          size: file.size,
          projectId
        });
      }

      setProjectsState(prev => prev.map(project =>
        project.id === projectId
          ? { ...project, files: [...(project.files || []), ...files] }
          : project
      ));
    } catch (error) {
      console.error('파일 추가 실패:', error);
    }
  };

  // Rename handlers
  const handleRenameProject = (projectId: string) => {
    const project = projectsState.find(p => p.id === projectId);
    if (project) {
      setRenameTarget({ type: 'project', id: projectId, currentName: project.name });
      setRenameDialogOpen(true);
    }
  };

  const handleRenameConversation = (conversationId: string) => {
    for (const project of projectsState) {
      const conversation = project.conversations.find(c => c.id === conversationId);
      if (conversation) {
        setRenameTarget({ type: 'conversation', id: conversationId, currentName: conversation.title });
        setRenameDialogOpen(true);
        break;
      }
    }
  };

  const handleRename = async (newName: string) => {
    if (!renameTarget) return;

    // 비회원: 로컬 상태만 업데이트
    if (!isLoggedIn) {
      if (renameTarget.type === 'project') {
        setProjectsState(prev => prev.map(project =>
          project.id === renameTarget.id
            ? { ...project, name: newName }
            : project
        ));
      } else {
        setProjectsState(prev => prev.map(project => ({
          ...project,
          conversations: project.conversations.map(conv =>
            conv.id === renameTarget.id
              ? { ...conv, title: newName }
              : conv
          )
        })));
      }
      return;
    }

    // 회원: 서버에도 저장
    try {
      if (renameTarget.type === 'project') {
        await apiService.updateProject(renameTarget.id, { name: newName });
        setProjectsState(prev => prev.map(project =>
          project.id === renameTarget.id
            ? { ...project, name: newName }
            : project
        ));
      } else {
        await apiService.updateConversation(renameTarget.id, { title: newName });
        setProjectsState(prev => prev.map(project => ({
          ...project,
          conversations: project.conversations.map(conv =>
            conv.id === renameTarget.id
              ? { ...conv, title: newName }
              : conv
          )
        })));
      }
    } catch (error) {
      console.error('이름 변경 실패:', error);
      alert('이름 변경에 실패했습니다.');
    }
  };

  // Export handler
  const handleExportProject = (projectId: string) => {
    const project = projectsState.find(p => p.id === projectId);
    if (project) {
      setExportProject(project);
      setExportDialogOpen(true);
    }
  };

  // Library handlers
  const handleImportTemplate = async (template: any) => {
    try {
      const apiProject = await apiService.createProject({
        name: template.name,
        category: template.category,
        guidelines: template.instructions
      });

      const newProject = transformApiProject(apiProject);
      
      setProjectsState(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setActiveConversationId(null);
      setShowLibrary(false);
      
      alert(`"${template.name}" 템플릿이 내 프로젝트로 추가되었습니다!`);
    } catch (error) {
      console.error('템플릿 가져오기 실패:', error);
      alert('템플릿 가져오기에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        projects={projectsState}
        activeConversationId={activeConversationId}
        activeProjectId={activeProjectId}
        onSelectConversation={handleSelectConversation}
        onSelectProject={handleSelectProject}
        onToggleProject={handleToggleProject}
        onNewProject={handleNewProject}
        onApiKeySettings={() => setIsApiKeySettingsOpen(true)}
        onModelSettings={() => setIsModelSettingsOpen(true)}
        onLibrary={() => setShowLibrary(true)}
        onRenameConversation={handleRenameConversation}
        onRenameProject={handleRenameProject}
        onExportProject={handleExportProject}
        onAddConversation={handleAddConversation}
        onDeleteProject={async (projectId) => {
          if (window.confirm('프로젝트를 삭제하시겠습니까? 모든 대화도 함께 삭제됩니다.')) {
            try {
              await apiService.deleteProject(projectId);
              await apiService.deleteProjectFiles(projectId);
              setProjectsState(prev => prev.filter(p => p.id !== projectId));
              if (activeProjectId === projectId) {
                setActiveProjectId(null);
              }
            } catch (error) {
              console.error('프로젝트 삭제 실패:', error);
              alert('프로젝트 삭제에 실패했습니다.');
            }
          }
        }}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={isSidebarCollapsed}
        onCollapsedToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isLoggedIn={isLoggedIn}
        onLogin={() => setIsAuthDialogOpen(true)}
        onLogout={handleLogout}
        userName={currentUser?.name}
      />
      
      {showLibrary ? (
        <LibraryPage
          onImport={handleImportTemplate}
          onClose={() => setShowLibrary(false)}
        />
      ) : (
        <ChatArea
          projectTitle={activeProject?.name}
          projectConversations={activeProject?.conversations}
          projectFiles={activeProject?.files}
          projectGuidelines={activeProject?.guidelines}
          activeConversation={activeConversation}
          onSendMessage={handleSendMessage}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSelectConversation={handleSelectConversation}
          onAddFiles={(files) => activeProjectId && handleAddFiles(activeProjectId, files)}
          onAddConversation={() => handleAddConversation()}
          onDeleteProject={handleDeleteProject}
          onDeleteConversation={handleDeleteConversation}
          isLoggedIn={isLoggedIn}
          selectedModel={selectedModel}
          onModelChange={async (model) => {
            setSelectedModel(model);
            if (currentUser) {
              try {
                await apiService.updateSettings({ selectedModel: model });
              } catch (error) {
                console.error('모델 설정 저장 실패:', error);
              }
            }
          }}
          enabledModels={enabledModels}
          onOpenProjectSetup={() => {
            // 대화가 선택되어 있으면 해당 프로젝트 ID로 설정
            if (activeConversation?.projectId && !activeProjectId) {
              setActiveProjectId(activeConversation.projectId);
            }
            setIsProjectSetupDialogOpen(true);
          }}
        />
      )}
      
      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onClose={() => setIsNewProjectDialogOpen(false)}
        onCreateProject={handleCreateProject}
      />
      <ProjectSetupDialog
        isOpen={isProjectSetupDialogOpen}
        onClose={() => setIsProjectSetupDialogOpen(false)}
        onComplete={handleProjectSetupComplete}
        isLoggedIn={isLoggedIn}
        initialGuidelines={activeProject?.guidelines || ''}
        initialUploadPercentage={activeProject?.uploadPercentage || 100}
        initialFiles={activeProject?.files || []}
      />
      <AddConversationDialog
        isOpen={isAddConversationDialogOpen}
        onClose={() => {
          setIsAddConversationDialogOpen(false);
          setPendingProjectId(null);
        }}
        onSelectRole={handleSelectRole}
        projectName={pendingProjectId ? projectsState.find(p => p.id === pendingProjectId)?.name : undefined}
      />
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLogin={handleLogin}
      />
      <ModelSettings
        isOpen={isModelSettingsOpen}
        onClose={() => setIsModelSettingsOpen(false)}
        enabledModels={enabledModels}
        onSaveEnabledModels={async (models) => {
          setEnabledModels(models);
          if (currentUser) {
            try {
              await apiService.updateSettings({ enabledModels: models });
            } catch (error) {
              console.error('활성화된 모델 설정 저장 실패:', error);
            }
          }
        }}
      />
      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        target={renameTarget}
        onRename={handleRename}
      />
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        project={exportProject}
      />
      <ApiKeySettings
        isOpen={isApiKeySettingsOpen}
        onClose={() => setIsApiKeySettingsOpen(false)}
        apiKeys={apiKeys}
        onSaveApiKeys={async (keys) => {
          setApiKeys(keys);
          if (currentUser) {
            try {
              await apiService.updateSettings({ apiKeys: keys });
            } catch (error) {
              console.error('API 키 저장 실패:', error);
            }
          }
        }}
      />
    </div>
  );
}