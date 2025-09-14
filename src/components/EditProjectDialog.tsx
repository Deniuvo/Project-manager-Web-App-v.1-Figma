import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Save, X } from "lucide-react";
import { Project, ProjectStatus } from "./ProjectCard";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject: (project: Project) => void;
}

const statusOptions = [
  { value: 'planned', label: 'Запланировано' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'submitted', label: 'Работа сдана' },
  { value: 'waiting-review', label: 'Ждем оценки' },
  { value: 'completed', label: 'Подведение итогов' },
];

export function EditProjectDialog({ project, open, onOpenChange, onUpdateProject }: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planned' as ProjectStatus,
    assignee: '',
    manager: '',
    deadline: ''
  });

  // Load project data when dialog opens
  useEffect(() => {
    if (project && open) {
      console.log('Loading project data into form:', project);
      const deadlineDate = project.deadline ? project.deadline.split('T')[0] : '';
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'planned',
        assignee: project.assignee || '',
        manager: project.manager || '',
        deadline: deadlineDate
      });
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    console.log('Submitting project update:', formData);

    const updatedProject: Project = {
      ...project,
      ...formData,
      deadline: formData.deadline.includes('T') ? formData.deadline : formData.deadline + 'T00:00:00Z'
    };

    console.log('Updated project data:', updatedProject);
    onUpdateProject(updatedProject);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Редактировать проект
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Название проекта *</Label>
            <Input
              id="edit-title"
              type="text"
              placeholder="Введите название проекта"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Описание проекта *</Label>
            <Textarea
              id="edit-description"
              placeholder="Опишите цели и задачи проекта"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-assignee">Исполнитель *</Label>
              <Input
                id="edit-assignee"
                type="text"
                placeholder="ФИО исполнителя"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                className="rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-manager">Руководитель *</Label>
              <Input
                id="edit-manager"
                type="text"
                placeholder="ФИО руководителя"
                value={formData.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                className="rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Статус проекта</Label>
              <Select value={formData.status} onValueChange={(value: ProjectStatus) => handleInputChange('status', value)}>
                <SelectTrigger className="rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Срок выполнения *</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="rounded-xl bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border hover:bg-accent transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}