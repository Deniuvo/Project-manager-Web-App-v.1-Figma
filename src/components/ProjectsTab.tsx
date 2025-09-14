import { useState } from "react";
import { ProjectCard, Project, ProjectStatus } from "./ProjectCard";
import { AddProjectDialog } from "./AddProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { ProjectAnalytics } from "./ProjectAnalytics";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Filter, AlertCircle, BarChart3, Grid3X3 } from "lucide-react";

interface ProjectsTabProps {
  projects: Project[];
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  isLoggedIn: boolean;
  isDemoMode?: boolean;
  onRequireAuth?: () => void;
}

export function ProjectsTab({ projects, onUpdateProject, onDeleteProject, onAddProject, isLoggedIn, isDemoMode, onRequireAuth }: ProjectsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (projectId: string, status: ProjectStatus) => {
    console.log('Handling status change:', { projectId, status, isLoggedIn });
    if (!isLoggedIn) {
      console.log('User not logged in, requiring auth');
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }
    const project = projects.find(p => p.id === projectId);
    if (project) {
      console.log('Updating project status:', project.id, 'from', project.status, 'to', status);
      onUpdateProject({ ...project, status });
    } else {
      console.warn('Project not found:', projectId);
    }
  };

  const handleEdit = (project: Project) => {
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleDelete = (projectId: string) => {
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      return;
    }
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setDeletingProject(project);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = () => {
    if (deletingProject) {
      onDeleteProject(deletingProject.id);
      setShowDeleteDialog(false);
      setDeletingProject(null);
    }
  };

  const getStatusStats = () => {
    const stats = {
      planned: projects.filter(p => p.status === 'planned').length,
      'in-progress': projects.filter(p => p.status === 'in-progress').length,
      submitted: projects.filter(p => p.status === 'submitted').length,
      'waiting-review': projects.filter(p => p.status === 'waiting-review').length,
      completed: projects.filter(p => p.status === 'completed').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Проекты</h1>
          <p className="text-muted-foreground mt-1">Управление всеми проектами компании</p>
        </div>
        <AddProjectDialog 
          onAddProject={onAddProject} 
          isLoggedIn={isLoggedIn}
          onRequireAuth={onRequireAuth}
        />
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Список проектов
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6 mt-6">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl font-semibold text-blue-600 mb-1">{stats.planned}</div>
            <div className="text-sm font-medium text-muted-foreground">Запланировано</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl font-semibold text-orange-600 mb-1">{stats['in-progress']}</div>
            <div className="text-sm font-medium text-muted-foreground">В работе</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl font-semibold text-purple-600 mb-1">{stats.submitted}</div>
            <div className="text-sm font-medium text-muted-foreground">Сданы</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl font-semibold text-yellow-600 mb-1">{stats['waiting-review']}</div>
            <div className="text-sm font-medium text-muted-foreground">На оценке</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl font-semibold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-sm font-medium text-muted-foreground">Завершены</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: ProjectStatus | 'all') => setStatusFilter(value)}>
            <SelectTrigger className="w-48 rounded-lg bg-input-background">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="planned">Запланировано</SelectItem>
              <SelectItem value="in-progress">В работе</SelectItem>
              <SelectItem value="submitted">Работа сдана</SelectItem>
              <SelectItem value="waiting-review">Ждем оценки</SelectItem>
              <SelectItem value="completed">Подведение итогов</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoggedIn={isLoggedIn}
            />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Проекты не найдены' 
                  : !isLoggedIn 
                    ? 'Нет доступных проектов для просмотра'
                    : 'Пока нет проектов. Создайте первый проект!'}
              </p>
            </div>
          )}
        </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ProjectAnalytics projects={projects} />
        </TabsContent>
      </Tabs>
      
      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editingProject}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdateProject={onUpdateProject}
      />
      
      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        project={deletingProject}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
}