import { FolderOpen, Users, Settings, Shield } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoggedIn?: boolean;
  userRoles?: string[];
}

export function Sidebar({ activeTab, onTabChange, isLoggedIn, userRoles = [] }: SidebarProps) {
  const menuItems = [
    { id: 'projects', label: 'Проекты', icon: FolderOpen },
    { id: 'managers', label: 'Руководители', icon: Users },
    { id: 'settings', label: 'Настройки системы', icon: Settings },
  ];

  // Добавляем админ-панель для администраторов и модераторов
  if (isLoggedIn && (userRoles.includes('admin') || userRoles.includes('moderator'))) {
    menuItems.push({ id: 'admin', label: 'Управление пользователями', icon: Shield });
  }

  return (
    <div className="h-full bg-card border-r border-border flex flex-col" style={{fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'}}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-medium text-foreground">ПРО ПРИОРИТЕТ</h1>
        <p className="text-sm text-muted-foreground mt-1">Управление проектами</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start h-10 px-3 rounded-lg transition-colors"
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Система управления проектами
          <br />
          Версия 2.0
        </div>
      </div>
    </div>
  );
}