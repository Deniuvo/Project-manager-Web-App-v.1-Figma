import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Project } from "./ProjectCard";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProjectDialog({ project, open, onOpenChange, onConfirm }: DeleteProjectDialogProps) {
  if (!project) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Удаление проекта
          </AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить проект <span className="font-medium">"{project.title}"</span>?
            <br />
            <br />
            Это действие нельзя будет отменить. Все данные проекта будут безвозвратно удалены.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить проект
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}