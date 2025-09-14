import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardTab } from "./components/DashboardTab";
import { ProjectsTab } from "./components/ProjectsTab";
import { ManagersTab } from "./components/ManagersTab";
import { SettingsTab } from "./components/SettingsTab";
import { AccountTab } from "./components/AccountTab";
import { AdminTab } from "./components/AdminTab";
import { Project } from "./components/ProjectCard";
import { supabase } from "./utils/supabase/client";
import { apiClient } from "./utils/api";



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showAccount, setShowAccount] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check for existing session on app start
  useEffect(() => {
    checkSession();
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Load projects when user logs in
  useEffect(() => {
    if (isLoggedIn && accessToken) {
      console.log('User logged in with token, loading projects...');
      loadProjects();
    }
  }, [isLoggedIn, accessToken]);

  // Load public projects on app start if no projects loaded and user not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn && projects.length === 0) {
      console.log('Loading public projects for viewing...');
      loadPublicProjects();
    }
  }, [isLoading, isLoggedIn, projects.length]);

  // Apply theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Session check result:', { 
        hasSession: !!session, 
        hasAccessToken: !!session?.access_token, 
        hasUser: !!session?.user, 
        userEmail: session?.user?.email,
        error: error?.message 
      });
      
      if (session?.access_token && session?.user?.email) {
        console.log('Valid session found, logging in user');
        setIsLoggedIn(true);
        setUserEmail(session.user.email);
        // Устанавливаем имя пользователя "Дени Сулейманов" по умолчанию
        setUserName(session.user.user_metadata?.name || "Дени Сулейманов");
        setAccessToken(session.access_token);
        // Для Дени Сулейманова устанавливаем роль администратора по умолчанию
        setUserRoles(['admin']);
        setIsDemoMode(false);
      } else {
        console.log('No valid session found');
        // Пользователь не авторизован, пытаемся загрузить публичные проекты
        setIsDemoMode(false);
        await loadPublicProjects(); // Загружаем реальные проекты для всех
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!accessToken || !userEmail) {
      console.warn('No access token or user email available for loading projects');
      return;
    }
    
    // Сначала пытаемся загрузить из localStorage для быстрого отображения
    try {
      const localProjects = localStorage.getItem(`projects_${userEmail}`);
      if (localProjects) {
        const parsedProjects = JSON.parse(localProjects);
        console.log('Loaded projects from localStorage:', parsedProjects.length);
        setProjects(parsedProjects);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    // Затем пытаемся загрузить с сервера
    try {
      console.log('Loading projects from server with token:', accessToken.substring(0, 20) + '...');
      const result = await apiClient.getProjects(accessToken);
      if (result.data) {
        console.log('Successfully loaded projects from server:', result.data.projects.length);
        setProjects(result.data.projects);
        setIsDemoMode(false);
        // Сохраняем в localStorage
        localStorage.setItem(`projects_${userEmail}`, JSON.stringify(result.data.projects));
      } else if (result.error) {
        console.error('API error loading projects:', result.error);
        // Если ошибка API для авторизованного пользователя, используем локальные данные
        console.log('Using localStorage data due to API error');
      }
    } catch (error) {
      console.error('Network error loading projects:', error);
      // Если ошибка сети для авторизованного пользователя, используем локальные данные
      console.log('Using localStorage data due to network error');
    }
  };

  const loadPublicProjects = async () => {
    console.log('Loading public projects for viewing...');
    
    // Пытаемся загрузить сохраненные проекты из localStorage любого пользователя
    try {
      // Ищем проекты среди всех ключей localStorage
      const keys = Object.keys(localStorage);
      const projectKeys = keys.filter(key => key.startsWith('projects_') && !key.includes('undefined'));
      
      console.log('Found project keys in localStorage:', projectKeys);
      
      for (const key of projectKeys) {
        try {
          const projectsData = localStorage.getItem(key);
          if (projectsData) {
            const parsedProjects = JSON.parse(projectsData);
            if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
              console.log(`Loaded ${parsedProjects.length} public projects from localStorage key: ${key}`);
              setProjects(parsedProjects);
              return;
            }
          }
        } catch (parseError) {
          console.error('Error parsing projects from key:', key, parseError);
        }
      }
    } catch (error) {
      console.error('Error loading public projects from localStorage:', error);
    }

    // Если нет сохраненных проектов, показываем пустое состояние
    console.log('No projects found in localStorage, showing empty state');
    setProjects([]);
  };

  const loadDemoProjects = loadPublicProjects; // Алиас для совместимости

  const handleLogin = (email: string, name: string, token: string) => {
    console.log('Handling login for:', email, 'with token:', token.substring(0, 20) + '...');
    setUserEmail(email);
    setUserName(name);
    setAccessToken(token);
    setIsLoggedIn(true);
    // Для Дени Сулейманова устанавливаем роль администратора по умолчанию
    setUserRoles(['admin']);
    setIsDemoMode(false);
    setShowAccount(false);
    setShowLoginPrompt(false);
    // Загружаем реальные проекты пользователя будет через useEffect
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setUserEmail("");
      setUserName("");
      setAccessToken("");
      setUserRoles([]);
      // Не очищаем проекты, а загружаем публичные для просмотра
      await loadPublicProjects();
      setIsDemoMode(false);
      setActiveTab("projects");
      setShowAccount(false);
      setShowLoginPrompt(false);
    }
  };

  const handleAddProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const result = await apiClient.createProject(projectData, accessToken);
      if (result.data) {
        const updatedProjects = [...projects, result.data.project];
        setProjects(updatedProjects);
        localStorage.setItem(`projects_${userEmail}`, JSON.stringify(updatedProjects));
      } else if (result.error) {
        console.error('Failed to create project:', result.error);
        // Fallback to local storage
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        localStorage.setItem(`projects_${userEmail}`, JSON.stringify(updatedProjects));
      }
    } catch (error) {
      console.error('Add project error:', error);
      // Fallback to local storage
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem(`projects_${userEmail}`, JSON.stringify(updatedProjects));
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    console.log('Updating project:', updatedProject.id, updatedProject);

    // Сначала обновляем локально для быстрого отклика UI
    const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    localStorage.setItem(`projects_${userEmail}`, JSON.stringify(updatedProjects));

    // Затем пытаемся сохранить на сервер
    try {
      if (accessToken && !isDemoMode) {
        const result = await apiClient.updateProject(updatedProject.id, updatedProject, accessToken);
        if (result.error) {
          console.error('Failed to update project on server:', result.error);
          // Локальные изменения уже применены, просто логируем ошибку
        } else {
          console.log('Project updated successfully on server');
        }
      }
    } catch (error) {
      console.error('Update project network error:', error);
      // Локальные изменения уже применены, просто логируем ошибку
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const result = await apiClient.deleteProject(projectId, accessToken);
      if (result.data) {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        localStorage.setItem(`projects_${userEmail}`, JSON.stringify(updatedProjects));
      } else if (result.error) {
        console.error('Failed to delete project:', result.error);
        // Fallback to local storage
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        localStorage.setItem(`projects_${userEmail}`, JSON.stringify(updatedProjects));
      }
    } catch (error) {
      console.error('Delete project error:', error);
      // Fallback to local storage
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      localStorage.setItem(`projects_${userEmail}`, JSON.stringify(updatedProjects));
    }
  };

  const requireAuth = (action: () => void) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return false;
    }
    action();
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative w-8 h-8 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-700 rounded-lg"></div>
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-lg animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-screen bg-background"
      style={{fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'}}
    >
      {/* Header */}
      <Header 
        isLoggedIn={isLoggedIn}
        userName={userName}
        onAccountClick={() => setShowAccount(true)}
        onLogout={handleLogout}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - 2 columns */}
        <div className="w-2/12">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isLoggedIn={isLoggedIn}
            userRoles={userRoles}
          />
        </div>
        
        {/* Main content - 10 columns */}
        <div className="flex-1 overflow-auto">
          {isDemoMode && isLoggedIn && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-0">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    <strong>Демо режим:</strong> Сервер недоступен, данные сохраняются локально в браузере.
                  </p>
                </div>
              </div>
            </div>
          )}


          
          <AccountTab 
            onLogin={handleLogin}
            onClose={() => {
              setShowAccount(false);
              setShowLoginPrompt(false);
            }}
            isLoggedIn={isLoggedIn}
            isOpen={showAccount || showLoginPrompt}
          />
          
          {activeTab === "projects" && (
            <ProjectsTab
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onAddProject={handleAddProject}
              isLoggedIn={isLoggedIn}
              isDemoMode={isDemoMode}
              onRequireAuth={() => setShowLoginPrompt(true)}
            />
          )}
          
          {activeTab === "managers" && (
            <ManagersTab
              projects={projects}
              accessToken={accessToken}
              isLoggedIn={isLoggedIn}
              userEmail={userEmail}
            />
          )}
          
          {activeTab === "settings" && (
            <SettingsTab 
              accessToken={accessToken} 
              userEmail={userEmail}
              userName={userName}
              isDarkMode={isDarkMode}
              onThemeChange={setIsDarkMode}
              onLogout={handleLogout}
              isLoggedIn={isLoggedIn}
            />
          )}
          
          {activeTab === "admin" && (
            <AdminTab
              accessToken={accessToken}
              isLoggedIn={isLoggedIn}
              currentUserEmail={userEmail}
              userRoles={userRoles}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;