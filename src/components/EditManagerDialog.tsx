import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { User, Mail, Briefcase, Building } from "lucide-react";

interface Manager {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  projectCount: number;
  assignedBy?: string; // Кто назначил этого руководителя
}

interface EditManagerDialogProps {
  manager: Manager | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (manager: Manager) => void;
  currentUserEmail: string;
}

export function EditManagerDialog({ 
  manager, 
  isOpen, 
  onClose, 
  onSave,
  currentUserEmail 
}: EditManagerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем форму при изменении manager
  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name || "",
        email: manager.email || "",
        position: manager.position || "",
        department: manager.department || "",
      });
    }
  }, [manager]);

  const handleSave = async () => {
    if (!manager) return;
    
    setIsLoading(true);
    try {
      const updatedManager: Manager = {
        ...manager,
        ...formData,
        assignedBy: manager.assignedBy || currentUserEmail
      };
      
      onSave(updatedManager);
      onClose();
    } catch (error) {
      console.error('Error updating manager:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!manager) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Редактировать руководителя
          </DialogTitle>
          <DialogDescription>
            Обновите информацию о руководителе проекта
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manager-name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Полное имя
            </Label>
            <Input
              id="manager-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Имя Фамилия"
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manager-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="manager-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@university.ru"
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manager-position" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Должность
            </Label>
            <Input
              id="manager-position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Руководитель проекта"
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manager-department" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Отдел
            </Label>
            <Input
              id="manager-department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="Отдел развития"
              className="rounded-xl"
            />
          </div>

          {manager.assignedBy && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Назначен:</strong> {manager.assignedBy}
              </p>
            </div>
          )}
          
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
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}