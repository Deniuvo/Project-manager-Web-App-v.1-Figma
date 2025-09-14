import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from "lucide-react";
import { Project, ProjectStatus, ProjectPriority } from "./ProjectCard";

interface AddProjectDialogProps {
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

export function AddProjectDialog({ onAddProject, isLoggedIn = true, onRequireAuth }: AddProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planned' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
    progress: 0,
    assignee: '',
    manager: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      setOpen(false);
      return;
    }
    if (formData.title && formData.assignee && formData.manager && formData.deadline) {
      onAddProject(formData);
      setFormData({
        title: '',
        description: '',
        status: 'planned',
        priority: 'medium',
        progress: 0,
        assignee: '',
        manager: '',
        deadline: ''
      });
      setOpen(false);
    }
  };

  const handleTriggerClick = () => {
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl px-6 py-3 h-auto font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-0 ${!isLoggedIn ? 'opacity-50' : ''}`}
          onClick={handleTriggerClick}
          title={!isLoggedIn ? 'Для добавления проекта требуется авторизация' : 'Создать новый проект'}
        >
          <Plus className="h-5 w-5 mr-2" />
          Добавить проект
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Создать новый проект</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Название проекта</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название проекта"
              className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание проекта"
              className="rounded-xl bg-input-background border-border min-h-[90px] px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-sm font-medium">Исполнитель</Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Имя исполнителя"
              className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager" className="text-sm font-medium">Руководитель</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              placeholder="Имя руководителя"
              className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium">Срок выполнения</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Статус</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="rounded-xl bg-input-background border-border h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Запланировано</SelectItem>
                <SelectItem value="in-progress">В работе</SelectItem>
                <SelectItem value="submitted">Работа сдана</SelectItem>
                <SelectItem value="waiting-review">Ждем оценки</SelectItem>
                <SelectItem value="completed">Подведение итогов</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="flex-1 rounded-xl h-11 border-border hover:bg-accent transition-colors"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-2xl h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            >
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}