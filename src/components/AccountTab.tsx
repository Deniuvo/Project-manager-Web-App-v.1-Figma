import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { X, User, Mail, Briefcase, Lock, AlertCircle, Key, Shield, Settings } from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { apiClient } from "../utils/api";

interface AccountManagementProps {
  onClose: () => void;
}

function AccountManagement({ onClose }: AccountManagementProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [position, setPosition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load current user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setNewEmail(user.email || "");
          setDisplayName(user.user_metadata?.name || user.user_metadata?.full_name || "");
          setPosition(user.user_metadata?.position || "");
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          name: displayName,
          full_name: displayName,
          position: position
        }
      });

      if (updateError) {
        setError(`Ошибка обновления профиля: ${updateError.message}`);
        return;
      }

      setSuccess("Профиль успешно обновлен!");
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Произошла ошибка при обновлении профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Новые пароли не совпадают");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Новый пароль должен содержать минимум 6 символов");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError(`Ошибка смены пароля: ${updateError.message}`);
        return;
      }

      setSuccess("Пароль успешно изменен!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Password change error:', error);
      setError('Произошла ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) {
        setError(`Ошибка смены email: ${updateError.message}`);
        return;
      }

      setSuccess("Запрос на смену email отправлен. Проверьте новую почту для подтверждения.");
    } catch (error) {
      console.error('Email change error:', error);
      setError('Произошла ошибка при смене email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      window.location.reload(); // Reload page to reset state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
          {success}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Информация профиля
              </CardTitle>
              <CardDescription>
                Обновите информацию о своем профиле
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Отображаемое имя</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Иван Иванов"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-xl bg-input-background border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="Руководитель проекта"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="rounded-xl bg-input-background border-border"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Обновление..." : "Обновить профиль"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Смена пароля
              </CardTitle>
              <CardDescription>
                Обновите пароль для вашей учетной записи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl bg-input-background border-border"
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl bg-input-background border-border"
                    minLength={6}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full rounded-xl"
                  disabled={isLoading || !newPassword || !confirmPassword}
                >
                  {isLoading ? "Изменение..." : "Изменить пароль"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Смена email
              </CardTitle>
              <CardDescription>
                Обновите email адрес для вашей учетной записи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Новый email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="new@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="rounded-xl bg-input-background border-border"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Отправка..." : "Изменить email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Управление аккаунтом
              </CardTitle>
              <CardDescription>
                Действия с учетной записью
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={onClose}
                variant="outline" 
                className="w-full rounded-xl"
              >
                Закрыть настройки
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="w-full rounded-xl"
              >
                Выйти из системы
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AccountTabProps {
  onLogin: (email: string, name: string, accessToken: string) => void;
  onClose: () => void;
  isLoggedIn: boolean;
  isOpen?: boolean;
}

export function AccountTab({ onLogin, onClose, isLoggedIn, isOpen = true }: AccountTabProps) {
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Registration state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError || !data.session?.access_token) {
        setError(`Ошибка входа: ${signInError?.message || 'Неизвестная ошибка'}`);
        return;
      }

      const userName = data.user?.user_metadata?.name || 
                      data.user?.user_metadata?.full_name || 
                      `${data.user?.user_metadata?.first_name || ''} ${data.user?.user_metadata?.last_name || ''}`.trim() ||
                      loginEmail;

      // Сохраняем данные для входа если включен "Запомнить меня"
      if (rememberMe) {
        localStorage.setItem('rememberLogin', 'true');
        localStorage.setItem('lastEmail', loginEmail);
      } else {
        localStorage.removeItem('rememberLogin');
        localStorage.removeItem('lastEmail');
      }

      onLogin(loginEmail, userName, data.session.access_token);
      setSuccess("Вход выполнен успешно!");
    } catch (error) {
      console.error('Login error:', error);
      setError('Произошла ошибка при входе: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !position || !regEmail || !regPassword) {
      setError("Все поля обязательны для заполнения");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const fullName = `${firstName} ${lastName}`;
      
      // First test server connectivity
      console.log('Testing server connectivity...');
      const healthResult = await apiClient.healthCheck();
      if (healthResult.error) {
        setError(`Сервер недоступен: ${healthResult.error}`);
        setIsLoading(false);
        return;
      }

      console.log('Server is healthy, proceeding with signup...');
      const signupResult = await apiClient.signup(regEmail, regPassword, fullName);
      if (signupResult.error) {
        // Fallback: try direct Supabase signup if server fails
        console.log('Server signup failed, trying direct Supabase signup...');
        try {
          const { data: signupData, error: directSignupError } = await supabase.auth.signUp({
            email: regEmail,
            password: regPassword,
            options: {
              data: { 
                name: fullName,
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                position: position
              }
            }
          });

          if (directSignupError) {
            if (directSignupError.message.includes('already been registered')) {
              setError('Пользователь с таким email уже зарегистрирован. Попробуйте войти в систему.');
            } else {
              setError(`Ошибка регистрации: ${directSignupError.message}`);
            }
            setIsLoading(false);
            return;
          }

          // Try to sign in immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: regEmail,
            password: regPassword,
          });

          if (signInError || !signInData.session?.access_token) {
            setSuccess('Регистрация успешна! Теперь вы можете войти в систему.');
            setIsLoading(false);
            return;
          }

          onLogin(regEmail, fullName, signInData.session.access_token);
          setSuccess("Регистрация и вход выполнены успешно!");
          setIsLoading(false);
          return;
        } catch (fallbackError) {
          setError(`Ошибка регистрации: ${signupResult.error}`);
          setIsLoading(false);
          return;
        }
      }

      // After successful signup, sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: regEmail,
        password: regPassword,
      });

      if (signInError || !data.session?.access_token) {
        setSuccess('Регистрация успешна! Теперь вы можете войти в систему.');
        setIsLoading(false);
        return;
      }

      onLogin(regEmail, fullName, data.session.access_token);
      setSuccess("Регистрация и вход выполнены успешно!");
    } catch (error) {
      console.error('Registration error:', error);
      setError('Произошла ошибка при регистрации: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем сохраненные данные при монтировании
  useEffect(() => {
    const rememberLogin = localStorage.getItem('rememberLogin') === 'true';
    const lastEmail = localStorage.getItem('lastEmail') || '';
    if (rememberLogin && lastEmail) {
      setLoginEmail(lastEmail);
      setRememberMe(true);
    }
  }, []);

  if (isLoggedIn) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Управление аккаунтом
            </DialogTitle>
            <DialogDescription>
              Настройки профиля и безопасности учетной записи
            </DialogDescription>
          </DialogHeader>
          
          <AccountManagement onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6" />
            Учетная запись
          </DialogTitle>
          <DialogDescription>
            Войдите в систему или создайте новую учетную запись для управления проектами
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Настройка учетной записи
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Для новых пользователей: пожалуйста, пройдите регистрацию или войдите в существующую учетную запись для доступа к системе управления проектами.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Регистрация
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-0">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Вход в систему</h3>
                <p className="text-sm text-muted-foreground">
                  Введите ваши учетные данные для входа
                </p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email (логин)
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="rounded-xl bg-input-background border-border h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Пароль для входа
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="rounded-xl bg-input-background border-border h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Запомнить меня
                  </Label>
                </div>
                
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                    {success}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Вход...
                    </div>
                  ) : (
                    "Войти в систему"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-0">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Регистрация</h3>
                <p className="text-sm text-muted-foreground">
                  Создайте новую учетную запись для работы с системой
                </p>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      Имя
                    </Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="Иван"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-sm font-medium">Фамилия</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Иванов"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4" />
                    Должность
                  </Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="Руководитель проекта"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email (логин)
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Пароль для входа
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Минимум 6 символов
                  </p>
                </div>
                
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                    {success}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Регистрация...
                    </div>
                  ) : (
                    "Зарегистрироваться"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}