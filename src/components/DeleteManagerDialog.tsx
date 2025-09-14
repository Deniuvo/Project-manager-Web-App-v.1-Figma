import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface Manager {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  projectCount: number;
  assignedBy?: string;
}

interface DeleteManagerDialogProps {
  manager: Manager | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteManagerDialog({ manager, open, onOpenChange, onConfirm }: DeleteManagerDialogProps) {
  if (!manager) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Удалить руководителя
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Вы уверены, что хотите удалить руководителя <strong>{manager.name}</strong>?
            </p>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p><strong>Email:</strong> {manager.email}</p>
              <p><strong>Проектов:</strong> {manager.projectCount}</p>
              {manager.assignedBy && (
                <p><strong>Назначен:</strong> {manager.assignedBy}</p>
              )}
            </div>
            <p className="text-destructive font-medium">
              Данное действие нельзя отменить.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}