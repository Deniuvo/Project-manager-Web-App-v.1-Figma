import { Calendar, User, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { StatusBadge, ProjectStatus } from "./StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  assignee: string;
  manager: string;
  deadline: string;
  createdAt: string;
}

interface ProjectCardProps {
  project: Project;
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  isLoggedIn?: boolean;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Запланировано' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'submitted', label: 'Работа сдана' },
  { value: 'waiting-review', label: 'Ждем оценки' },
  { value: 'completed', label: 'Подведение итогов' },
];

export function ProjectCard({ project, onStatusChange, onEdit, onDelete, isLoggedIn = true }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-2 text-lg leading-tight">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 rounded-lg hover:bg-accent"
                  title="Действия"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => onEdit(project)} 
                  className="cursor-pointer"
                >
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(project.id)}
                  className="text-destructive cursor-pointer"
                >
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={project.status} />
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs px-3 py-2 rounded-lg border-border hover:bg-accent transition-colors"
                    title="Изменить статус проекта"
                  >
                    Изменить статус
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => onStatusChange(project.id, option.value)}
                      className={`cursor-pointer ${project.status === option.value ? 'bg-accent font-medium' : ''}`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="border-t border-border pt-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Исполнитель:</span>
                </div>
                <span className="text-foreground font-medium">{project.assignee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Руководитель:</span>
                </div>
                <span className="text-foreground font-medium">{project.manager}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Срок:</span>
                </div>
                <span className="text-foreground font-medium">
                  {new Date(project.deadline).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}