import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { User, Shield } from "lucide-react";

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

interface EditUserRolesDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, roles: string[]) => void;
}

const availableRoles = [
  { id: 'admin', label: 'Администратор', description: 'Полный доступ к системе' },
  { id: 'moderator', label: 'Модератор', description: 'Управление пользователями и контентом' },
  { id: 'manager', label: 'Руководитель', description: 'Управление проектами и командой' },
  { id: 'user', label: 'Пользователь', description: 'Базовые права пользователя' },
];

export function EditUserRolesDialog({ 
  user, 
  isOpen, 
  onClose, 
  onSave 
}: EditUserRolesDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем выбранные роли при изменении пользователя
  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || []);
    }
  }, [user]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      const hasRole = prev.includes(roleId);
      if (hasRole) {
        const newRoles = prev.filter(r => r !== roleId);
        // Убеждаемся, что у пользователя всегда есть хотя бы одна роль
        return newRoles.length === 0 ? ['user'] : newRoles;
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      onSave(user.id, selectedRoles);
      onClose();
    } catch (error) {
      console.error('Error updating user roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Управление ролями пользователя
          </DialogTitle>
          <DialogDescription>
            Настройте права доступа для {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-4">
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => handleRoleToggle(role.id)}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={`role-${role.id}`} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    {role.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Выбранные роли:</strong> {selectedRoles.length === 0 ? 'Нет' : selectedRoles.map(r => 
                availableRoles.find(ar => ar.id === r)?.label
              ).join(', ')}
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || selectedRoles.length === 0}
              className="flex-1"
            >
              {isLoading ? "Сохранение..." : "Сохранить роли"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}