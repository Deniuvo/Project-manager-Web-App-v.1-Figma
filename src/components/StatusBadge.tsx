import { Badge } from "./ui/badge";

export type ProjectStatus = 'planned' | 'in-progress' | 'submitted' | 'waiting-review' | 'completed';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig = {
  'planned': {
    label: 'Запланировано',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  'in-progress': {
    label: 'В работе',
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  'submitted': {
    label: 'Работа сдана',
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  'waiting-review': {
    label: 'Ждем оценки',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'completed': {
    label: 'Подведение итогов',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-700 border-green-200'
  }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} text-xs px-2 py-1 rounded-md border`}
    >
      {config.label}
    </Badge>
  );
}