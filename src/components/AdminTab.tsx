import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Users, Search, User, Mail, Calendar, Shield, Trash2, Edit, AlertCircle, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { EditUserRolesDialog } from "./EditUserRolesDialog";

interface User {
  id: string;
  name: string;
  email: string;
  roles: ('admin' | 'moderator' | 'manager' | 'user')[];
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  projectsCount: number;
}

interface AdminTabProps {
  accessToken: string;
  isLoggedIn: boolean;
  currentUserEmail: string;
  userRoles?: string[];
}

export function AdminTab({ accessToken, isLoggedIn, currentUserEmail, userRoles = [] }: AdminTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'moderator' | 'manager' | 'user'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRolesDialog, setShowRolesDialog] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadUsers();
    }
  }, [isLoggedIn, accessToken]);

  const loadUsers = async () => {
    setIsLoading(true);
    
    try {
      // Сначала пытаемся загрузить из localStorage
      const localUsers = localStorage.getItem('admin_users');
      if (localUsers) {
        const parsedUsers = JSON.parse(localUsers);
        console.log('Loaded users from localStorage:', parsedUsers.length);
        setUsers(parsedUsers);
      } else {
        // Если нет сохраненных данных, создаем демо данные
        loadDemoUsers();
      }
      
      // Пытаемся загрузить реальных пользователей с сервера
      if (accessToken) {
        console.log('Loading users from server...');
        // TODO: Заменить на реальный API call когда backend будет готов
        // const response = await fetch(`${server}/users`, {
        //   headers: { 'Authorization': `Bearer ${accessToken}` }
        // });
        // const users = await response.json();
        // setUsers(users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      loadDemoUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoUsers = () => {
    // Создаем базовых пользователей включая текущего
    const demoUsers: User[] = [];
    
    // Добавляем текущего пользователя, если он авторизован
    if (currentUserEmail) {
      demoUsers.push({
        id: '1',
        name: 'Дени Сулейманов',
        email: currentUserEmail,
        roles: ['admin'],
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        projectsCount: 0
      });
    }
    
    // Добавляем несколько демо пользователей для тестирования
    demoUsers.push({
      id: '2',
      name: 'Анна Петрова',
      email: 'anna.petrova@chgu.ru',
      roles: ['moderator', 'manager'],
      status: 'active',
      lastLogin: new Date(Date.now() - 86400000).toISOString(), // вчера
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), // неделю назад
      projectsCount: 3
    });
    
    demoUsers.push({
      id: '3',
      name: 'Иван Сидоров',
      email: 'ivan.sidorov@chgu.ru',
      roles: ['manager'],
      status: 'active',
      lastLogin: new Date(Date.now() - 3600000).toISOString(), // час назад
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), // две недели назад
      projectsCount: 5
    });
    
    demoUsers.push({
      id: '4',
      name: 'Мария Козлова',
      email: 'maria.kozlova@chgu.ru',
      roles: ['user'],
      status: 'inactive',
      lastLogin: new Date(Date.now() - 30 * 86400000).toISOString(), // месяц назад
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(), // два месяца назад
      projectsCount: 1
    });
    
    demoUsers.push({
      id: '5',
      name: 'Алексей Волков',
      email: 'alexey.volkov@chgu.ru',
      roles: ['moderator'],
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 часа назад
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString(), // три недели назад
      projectsCount: 2
    });
    
    demoUsers.push({
      id: '6',
      name: 'Елена Смирнова',
      email: 'elena.smirnova@chgu.ru',
      roles: ['user'],
      status: 'active',
      lastLogin: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 часов назад
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 дней назад
      projectsCount: 0
    });
    
    demoUsers.push({
      id: '7',
      name: 'Павел Николаев',
      email: 'pavel.nikolaev@chgu.ru',
      roles: ['user', 'moderator'],
      status: 'active',
      lastLogin: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 часов назад
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(), // 4 недели назад
      projectsCount: 1
    });
    
    setUsers(demoUsers);
    // Сохраняем в localStorage
    localStorage.setItem('admin_users', JSON.stringify(demoUsers));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.roles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      // TODO: Добавить реальный API call
      // await fetch(`${server}/users/${userId}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${accessToken}` }
      // });
      
      // Локальное обновление
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      // Сохраняем в localStorage
      localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
      console.log('User deleted and saved:', userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleToggleUserRole = async (userId: string, role: 'admin' | 'moderator' | 'manager' | 'user') => {
    try {
      // TODO: Добавить реальный API call
      
      // Локальное обновление - добавляем или убираем роль
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const hasRole = u.roles.includes(role);
          const newRoles = hasRole 
            ? u.roles.filter(r => r !== role)
            : [...u.roles, role];
          
          // Убеждаемся, что у пользователя всегда есть хотя бы одна роль
          if (newRoles.length === 0) {
            newRoles.push('user');
          }
          
          return { ...u, roles: newRoles };
        }
        return u;
      }));
      console.log('User role toggled:', userId, role);
    } catch (error) {
      console.error('Failed to toggle user role:', error);
    }
  };

  const handleEditUserRoles = (user: User) => {
    setEditingUser(user);
    setShowRolesDialog(true);
  };

  const handleSaveUserRoles = (userId: string, roles: string[]) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, roles } : u
    );
    setUsers(updatedUsers);
    // Сохраняем в localStorage
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    console.log('User roles updated and saved:', userId, roles);
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    try {
      // TODO: Добавить реальный API call
      // await fetch(`${server}/users/${userId}/status`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Authorization': `Bearer ${accessToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Локальное обновление
      const updatedUsers = users.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus }
          : u
      );
      setUsers(updatedUsers);
      // Сохраняем в localStorage
      localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
      console.log('User status updated and saved:', userId, newStatus);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'moderator': return 'Модератор';
      case 'manager': return 'Руководитель';
      case 'user': return 'Пользователь';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      case 'manager': return 'default';
      case 'user': return 'secondary';
      default: return 'secondary';
    }
  };

  // Проверяем права доступа
  const hasAccess = isLoggedIn && (userRoles.includes('admin') || userRoles.includes('moderator'));

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-foreground">Управление пользователями</h1>
            <p className="text-muted-foreground mt-1">Администрирование учетных записей</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {!isLoggedIn ? 'Войдите в систему' : 'Доступ запрещен'}
              </h3>
              <p className="text-muted-foreground">
                {!isLoggedIn 
                  ? 'Чтобы получить доступ к админ-панели, необходимо войти в учетную запись'
                  : 'У вас нет прав для доступа к этому разделу. Требуются права администратора или модератора.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Управление пользователями</h1>
          <p className="text-muted-foreground mt-1">Администрирование учетных записей и ролей</p>
        </div>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4" />
          Добавить пользователя
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Всего пользователей</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-sm text-muted-foreground">Активных</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{users.filter(u => u.roles.includes('admin')).length}</p>
              <p className="text-sm text-muted-foreground">Администраторов</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <User className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{users.filter(u => u.roles.includes('moderator')).length}</p>
              <p className="text-sm text-muted-foreground">Модераторов</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{users.filter(u => u.roles.includes('manager')).length}</p>
              <p className="text-sm text-muted-foreground">Руководителей</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{users.filter(u => u.roles.includes('user')).length}</p>
              <p className="text-sm text-muted-foreground">Пользователей</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск пользователей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'admin', 'moderator', 'manager', 'user'] as const).map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole(role)}
              className="rounded-lg"
            >
              {role === 'all' ? 'Все роли' : getRoleLabel(role)}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Список пользователей ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="ml-3 text-muted-foreground">Загрузка пользователей...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Проекты</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="w-[70px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                          {getRoleLabel(role)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.projectsCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ru-RU') : 'Никогда'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUserRoles(user)}>
                          Управление ролями
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                          {user.status === 'active' ? 'Деактивировать' : 'Активировать'}
                        </DropdownMenuItem>
                        {user.email !== currentUserEmail && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Удалить пользователя
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей для отображения'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Roles Dialog */}
      <EditUserRolesDialog
        user={editingUser}
        isOpen={showRolesDialog}
        onClose={() => {
          setShowRolesDialog(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUserRoles}
      />
    </div>
  );
}