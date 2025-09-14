import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Users, Search, User, FolderOpen, Calendar, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Project } from "./ProjectCard";
import { StatusBadge } from "./StatusBadge";
import { EditManagerDialog } from "./EditManagerDialog";
import { DeleteManagerDialog } from "./DeleteManagerDialog";

interface Manager {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  projectCount: number;
  assignedBy?: string; // Кто назначил этого руководителя
}

interface ManagersTabProps {
  projects: Project[];
  accessToken: string;
  isLoggedIn: boolean;
  userEmail?: string;
}

export function ManagersTab({ projects, accessToken, isLoggedIn, userEmail = "" }: ManagersTabProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingManager, setDeletingManager] = useState<Manager | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletedManagers, setDeletedManagers] = useState<Set<string>>(new Set());

  // Этот useEffect больше не нужен, так как загрузка происходит в generateManagers

  useEffect(() => {
    if (isLoggedIn && projects.length > 0) {
      generateManagers();
    } else if (!isLoggedIn) {
      // Очищаем состояние при выходе
      setManagers([]);
      setDeletedManagers(new Set());
      setSelectedManager(null);
    }
  }, [projects, isLoggedIn, userEmail]);

  const generateManagers = () => {
    // Получаем актуальный список удаленных менеджеров из localStorage
    let currentDeletedManagers = new Set<string>();
    if (userEmail) {
      try {
        const deletedData = localStorage.getItem(`deleted_managers_${userEmail}`);
        if (deletedData) {
          const deletedArray = JSON.parse(deletedData);
          currentDeletedManagers = new Set(deletedArray);
        }
      } catch (error) {
        console.error('Error loading deleted managers:', error);
      }
    }

    // Extract unique managers from projects, исключая удаленных
    const managerMap = new Map<string, Manager>();
    
    projects.forEach(project => {
      const managerKey = project.manager || 'Не указан';
      // Пропускаем удаленных руководителей
      if (currentDeletedManagers.has(managerKey)) {
        return;
      }
      
      if (!managerMap.has(managerKey)) {
        managerMap.set(managerKey, {
          id: managerKey,
          name: managerKey,
          email: `${managerKey.toLowerCase().replace(/\s+/g, '.')}@university.ru`,
          position: 'Руководитель проекта',
          department: 'Отдел развития',
          projectCount: 0,
          assignedBy: userEmail || 'Система'
        });
      }
      
      const manager = managerMap.get(managerKey)!;
      manager.projectCount++;
    });

    setManagers(Array.from(managerMap.values()));
    // Синхронизируем состояние с тем, что мы прочитали
    setDeletedManagers(currentDeletedManagers);
  };

  const getManagerProjects = (managerName: string): Project[] => {
    return projects.filter(project => project.manager === managerName);
  };

  const handleEditManager = (manager: Manager) => {
    setEditingManager(manager);
    setShowEditDialog(true);
  };

  const handleSaveManager = (updatedManager: Manager) => {
    const updatedManagers = managers.map(m => m.id === updatedManager.id ? updatedManager : m);
    setManagers(updatedManagers);
    if (selectedManager?.id === updatedManager.id) {
      setSelectedManager(updatedManager);
    }
    // Сохраняем изменения в localStorage
    if (userEmail) {
      localStorage.setItem(`managers_${userEmail}`, JSON.stringify(updatedManagers));
    }
    // TODO: Добавить сохранение в API
  };

  const handleDeleteManager = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    if (manager) {
      setDeletingManager(manager);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteManager = () => {
    if (deletingManager && userEmail) {
      // Загружаем текущий список удаленных
      let currentDeletedManagers = new Set<string>();
      try {
        const deletedData = localStorage.getItem(`deleted_managers_${userEmail}`);
        if (deletedData) {
          const deletedArray = JSON.parse(deletedData);
          currentDeletedManagers = new Set(deletedArray);
        }
      } catch (error) {
        console.error('Error loading deleted managers:', error);
      }

      // Добавляем в список удаленных
      currentDeletedManagers.add(deletingManager.id);
      
      // Сохраняем в localStorage
      localStorage.setItem(`deleted_managers_${userEmail}`, JSON.stringify([...currentDeletedManagers]));
      
      // Очищаем выбранного менеджера если он удаляется
      if (selectedManager?.id === deletingManager.id) {
        setSelectedManager(null);
      }
      
      // Перегенерируем список менеджеров
      generateManagers();
      
      setShowDeleteDialog(false);
      setDeletingManager(null);
      // TODO: Добавить удаление из API
    }
  };

  const filteredManagers = managers.filter(manager => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return manager.name.toLowerCase().includes(searchLower) ||
           manager.email.toLowerCase().includes(searchLower) ||
           manager.department.toLowerCase().includes(searchLower) ||
           manager.position.toLowerCase().includes(searchLower);
  });

  // Неавторизованные пользователи теперь могут просматривать руководителей, но не могут их редактировать

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Руководители</h1>
          <p className="text-muted-foreground mt-1">Управление командой проектов</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск руководителей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Managers list */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Список руководителей ({filteredManagers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredManagers.map((manager) => (
                  <div
                    key={manager.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedManager?.id === manager.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedManager(manager)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {manager.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{manager.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {manager.projectCount} проектов
                            </Badge>
                            {isLoggedIn && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditManager(manager);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteManager(manager.id);
                                  }}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{manager.position}</p>
                        <p className="text-xs text-muted-foreground truncate">{manager.department}</p>
                        {manager.assignedBy && (
                          <p className="text-xs text-muted-foreground/80 truncate">
                            Назначен: {manager.assignedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredManagers.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Руководители не найдены' : projects.length === 0 ? 'Создайте проекты, чтобы увидеть руководителей' : 'Нет данных о руководителях'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manager details and projects */}
        <div className="lg:col-span-7">
          {selectedManager ? (
            <div className="space-y-6">
              {/* Manager details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Информация о руководителе
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {selectedManager.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{selectedManager.name}</h3>
                      <p className="text-muted-foreground">{selectedManager.position}</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedManager.department}</p>
                      <p className="text-sm text-muted-foreground">{selectedManager.email}</p>
                      {selectedManager.assignedBy && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Назначен:</strong> {selectedManager.assignedBy}
                        </p>
                      )}
                      <div className="mt-3">
                        <Badge variant="outline">
                          {selectedManager.projectCount} активных проектов
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manager's projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Проекты руководителя
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getManagerProjects(selectedManager.name).map((project) => (
                      <div key={project.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{project.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(project.deadline).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <StatusBadge status={project.status} />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {getManagerProjects(selectedManager.name).length === 0 && (
                      <div className="text-center py-8">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          У этого руководителя пока нет активных проектов
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Выберите руководителя</h3>
                  <p className="text-muted-foreground">
                    Нажмите на руководителя из списка слева, чтобы увидеть подробную информацию и его проекты
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Manager Dialog */}
      <EditManagerDialog
        manager={editingManager}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingManager(null);
        }}
        onSave={handleSaveManager}
        currentUserEmail={userEmail}
      />

      {/* Delete Manager Dialog */}
      <DeleteManagerDialog
        manager={deletingManager}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteManager}
      />
    </div>
  );
}