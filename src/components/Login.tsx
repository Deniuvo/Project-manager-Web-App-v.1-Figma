import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { supabase } from "../utils/supabase/client";
import { apiClient } from "../utils/api";

interface LoginProps {
  onLogin: (email: string, accessToken: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign up
        if (!name) {
          setError("Имя обязательно для регистрации");
          setIsLoading(false);
          return;
        }

        // First test server connectivity
        console.log('Testing server connectivity...');
        const healthResult = await apiClient.healthCheck();
        if (healthResult.error) {
          setError(`Сервер недоступен: ${healthResult.error}`);
          setIsLoading(false);
          return;
        }

        console.log('Server is healthy, proceeding with signup...');
        const signupResult = await apiClient.signup(email, password, name);
        if (signupResult.error) {
          // Fallback: try direct Supabase signup if server fails
          console.log('Server signup failed, trying direct Supabase signup...');
          try {
            const { data: signupData, error: directSignupError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { name }
              }
            });

            if (directSignupError) {
              setError(`Ошибка регистрации: ${directSignupError.message}`);
              setIsLoading(false);
              return;
            }

            // Try to sign in immediately after signup
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (signInError || !signInData.session?.access_token) {
              setError(`Регистрация успешна, но ошибка входа: ${signInError?.message || 'Неизвестная ошибка'}`);
              setIsLoading(false);
              return;
            }

            onLogin(email, signInData.session.access_token);
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
          email,
          password,
        });

        if (signInError || !data.session?.access_token) {
          setError(`Ошибка входа после регистрации: ${signInError?.message || 'Неизвестная ошибка'}`);
          setIsLoading(false);
          return;
        }

        onLogin(email, data.session.access_token);
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !data.session?.access_token) {
          setError(`Ошибка входа: ${signInError?.message || 'Неизвестная ошибка'}`);
          return;
        }

        onLogin(email, data.session.access_token);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Произошла ошибка при выполнении запроса: ' + (error instanceof Error ? error.message : String(error)));
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background p-4"
      style={{fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'}}
    >
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">ПРО ПРИОРИТЕТ</CardTitle>
          <CardDescription>
            Войдите в систему управления проектами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Имя и фамилия</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя и фамилия"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg bg-input-background"
                  required={isSignUp}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg bg-input-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg bg-input-background"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full rounded-lg h-11 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Загрузка..." : isSignUp ? "Зарегистрироваться" : "Войти"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-sm"
            >
              {isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}