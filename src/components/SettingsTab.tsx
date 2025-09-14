import { useState, useEffect } from "react";
import { UserProfile } from "../types/team";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { User, Mail, Bell, Palette, Clock, Save, AlertCircle, Moon, Sun, Key } from "lucide-react";
import { apiClient } from "../utils/api";
import { supabase } from "../utils/supabase/client";

interface SettingsTabProps {
  accessToken: string;
  userEmail: string;
  userName: string;
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export function SettingsTab({ 
  accessToken, 
  userEmail, 
  userName, 
  isDarkMode, 
  onThemeChange, 
  onLogout, 
  isLoggedIn 
}: SettingsTabProps) {
  const [profile, setProfile] = useState<UserProfile>({
    id: userEmail,
    email: userEmail,
    name: userName,
    title: "",
    department: "",
    notifications: {
      email: true,
      push: true,
      desktop: false,
    },
    theme: isDarkMode ? 'dark' : 'light',
    language: 'ru',
    timezone: 'Europe/Moscow',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // Update profile when theme changes externally
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      theme: isDarkMode ? 'dark' : 'light'
    }));
  }, [isDarkMode]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.getUserProfile(accessToken);
      if (result.data) {
        setProfile({
          ...result.data.profile,
          name: userName, // Keep the updated name from login
          email: userEmail,
        });
      } else {
        console.error('Failed to load profile:', result.error);
        // Fallback to localStorage
        const localProfile = localStorage.getItem(`profile_${userEmail}`);
        if (localProfile) {
          const parsedProfile = JSON.parse(localProfile);
          setProfile({
            ...parsedProfile,
            name: userName, // Keep the updated name from login
            email: userEmail,
          });
        }
      }
    } catch (error) {
      console.error('Load profile error:', error);
      // Fallback to localStorage
      const localProfile = localStorage.getItem(`profile_${userEmail}`);
      if (localProfile) {
        const parsedProfile = JSON.parse(localProfile);
        setProfile({
          ...parsedProfile,
          name: userName, // Keep the updated name from login
          email: userEmail,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const result = await apiClient.updateUserProfile(profile, accessToken);
      if (result.data) {
        console.log('Profile updated successfully');
        localStorage.setItem(`profile_${userEmail}`, JSON.stringify(profile));
      } else {
        console.error('Failed to update profile:', result.error);
        // Still save to localStorage as fallback
        localStorage.setItem(`profile_${userEmail}`, JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      // Still save to localStorage as fallback
      localStorage.setItem(`profile_${userEmail}`, JSON.stringify(profile));
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof profile.notifications, value: boolean) => {
    setProfile({
      ...profile,
      notifications: {
        ...profile.notifications,
        [key]: value,
      },
    });
  };

  const handleThemeChange = (newTheme: string) => {
    const isDark = newTheme === 'dark';
    setProfile({
      ...profile,
      theme: newTheme,
    });
    onThemeChange(isDark);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Новые пароли не совпадают");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Новый пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        setPasswordError(`Ошибка смены пароля: ${error.message}`);
        return;
      }

      // Успешно изменен пароль
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
      setShowPasswordDialog(false);
      // Можно добавить toast уведомление
    } catch (error) {
      setPasswordError('Произошла ошибка при смене пароля');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-6">
        <h1 className="mb-6">Настройки системы</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <h3 className="text-lg font-medium mb-2">Требуется авторизация</h3>
              <p className="text-muted-foreground">
                Для доступа к настройкам системы необходимо войти в систему
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6">Настройки системы</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1>Настройки системы</h1>
        <Button 
          onClick={handleSaveProfile} 
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Профиль */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Профиль пользователя
            </CardTitle>
            <CardDescription>
              Управляйте информацией вашего профиля
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-lg">
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : userEmail.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Button variant="outline" size="sm">
                  Изменить фото
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG или GIF. Максимум 2MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Полное имя</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Введите ваше имя"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted mt-2"
                />
              </div>
              <div>
                <Label htmlFor="title">Должность</Label>
                <Input
                  id="title"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  placeholder="Ваша должность"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="department">Отдел</Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="Ваш отдел"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Внешний вид */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Внешний вид системы
            </CardTitle>
            <CardDescription>
              Настройте внешний вид интерфейса
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-blue-600" />
                ) : (
                  <Sun className="h-5 w-5 text-orange-500" />
                )}
                <div>
                  <Label>Темная тема</Label>
                  <p className="text-sm text-muted-foreground">
                    Переключение между светлой и темной темой интерфейса
                  </p>
                </div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={(checked) => handleThemeChange(checked ? 'dark' : 'light')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Select 
                  value={profile.timezone} 
                  onValueChange={(value) => setProfile({ ...profile, timezone: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите часовой пояс" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Moscow">Москва (GMT+3)</SelectItem>
                    <SelectItem value="Europe/London">Лондон (GMT+0)</SelectItem>
                    <SelectItem value="America/New_York">Нью-Йорк (GMT-5)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Токио (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Уведомления */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Настройки уведомлений
            </CardTitle>
            <CardDescription>
              Настройте способы получения уведомлений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления на email
                </p>
              </div>
              <Switch
                checked={profile.notifications.email}
                onCheckedChange={(value) => handleNotificationChange('email', value)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Push уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать push уведомления в браузере
                </p>
              </div>
              <Switch
                checked={profile.notifications.push}
                onCheckedChange={(value) => handleNotificationChange('push', value)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Уведомления на рабочем столе</Label>
                <p className="text-sm text-muted-foreground">
                  Показывать уведомления на рабочем столе
                </p>
              </div>
              <Switch
                checked={profile.notifications.desktop}
                onCheckedChange={(value) => handleNotificationChange('desktop', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные данные */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Дополнительные данные
            </CardTitle>
            <CardDescription>
              Дополнительная информация и настройки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Статистика работы</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Последний вход: Сегодня</p>
                  <p className="text-xs text-muted-foreground">Всего проектов: {/* This could be calculated */}</p>
                  <p className="text-xs text-muted-foreground">Активных задач: {/* This could be calculated */}</p>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Версия системы</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">ПРО ПРИОРИТЕТ v2.0</p>
                  <p className="text-xs text-muted-foreground">Обновлено: Декабрь 2024</p>
                  <p className="text-xs text-muted-foreground">Система управления проектами</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Управление аккаунтом */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Управление аккаунтом
            </CardTitle>
            <CardDescription>
              Управление аккаунтом и безопасностью
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Изменить пароль</Label>
                <p className="text-sm text-muted-foreground">
                  Обновите пароль для вашего аккаунта
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
              >
                Изменить пароль
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
              <div>
                <Label className="text-destructive">Выйти из аккаунта</Label>
                <p className="text-sm text-muted-foreground">
                  Завершить текущую сессию
                </p>
              </div>
              <Button variant="destructive" onClick={onLogout}>
                Выйти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Изменить пароль
            </DialogTitle>
            <DialogDescription>
              Введите новый пароль для вашей учетной записи
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="rounded-xl"
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="rounded-xl"
                minLength={6}
              />
            </div>
            
            {passwordError && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                {passwordError}
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordError("");
                }}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                className="flex-1"
              >
                Изменить пароль
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}