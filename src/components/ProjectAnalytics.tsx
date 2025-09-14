import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend
} from "recharts";
import { Project } from "./ProjectCard";
import { TrendingUp, Calendar, Clock, Target, Activity } from "lucide-react";

interface ProjectAnalyticsProps {
  projects: Project[];
}

const statusColors = {
  planned: '#8B5CF6',
  'in-progress': '#F59E0B',
  submitted: '#3B82F6',
  'waiting-review': '#EF4444',
  completed: '#10B981'
};

const statusLabels = {
  planned: 'Запланировано',
  'in-progress': 'В работе',
  submitted: 'Сданы',
  'waiting-review': 'На оценке',
  completed: 'Завершены'
};

export function ProjectAnalytics({ projects }: ProjectAnalyticsProps) {
  // Подготовка данных для диаграммы статусов
  const statusData = Object.entries(statusColors).map(([status, color]) => ({
    name: statusLabels[status as keyof typeof statusLabels],
    value: projects.filter(p => p.status === status).length,
    color
  }));

  // Подготовка данных для временной диаграммы (по месяцам создания)
  const monthlyData = (() => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const currentYear = new Date().getFullYear();
    const data = months.map((month, index) => ({
      month,
      created: 0,
      completed: 0
    }));

    projects.forEach(project => {
      const createdDate = new Date(project.createdAt);
      if (createdDate.getFullYear() === currentYear) {
        const monthIndex = createdDate.getMonth();
        data[monthIndex].created++;
        
        if (project.status === 'completed') {
          data[monthIndex].completed++;
        }
      }
    });

    return data;
  })();

  // Подготовка данных для диаграммы по приоритетам
  const priorityData = [
    { name: 'Высокий', value: projects.filter(p => p.priority === 'high').length, color: '#EF4444' },
    { name: 'Средний', value: projects.filter(p => p.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Низкий', value: projects.filter(p => p.priority === 'low').length, color: '#10B981' }
  ];

  // Метрики производительности
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
  const completionRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
  const averageProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) : 0;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-xl font-medium text-foreground mb-2">Аналитика проектов</h2>
        <p className="text-muted-foreground">Визуализация данных и показатели эффективности</p>
      </div>

      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Всего проектов</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{completionRate}%</p>
              <p className="text-sm text-muted-foreground">Завершенность</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{inProgressProjects}</p>
              <p className="text-sm text-muted-foreground">В работе</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{averageProgress}%</p>
              <p className="text-sm text-muted-foreground">Средний прогресс</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Диаграммы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение по статусам */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Распределение по статусам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Распределение по приоритетам */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Распределение по приоритетам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Динамика создания и завершения проектов */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Динамика проектов по месяцам ({new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Создано проектов"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Завершено проектов"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <Card>
        <CardHeader>
          <CardTitle>Подробная статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">{statusData.find(s => s.name === 'Запланировано')?.value || 0}</div>
              <div className="text-sm text-muted-foreground">Запланировано</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-orange-600">{statusData.find(s => s.name === 'В работе')?.value || 0}</div>
              <div className="text-sm text-muted-foreground">В работе</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">{statusData.find(s => s.name === 'Сданы')?.value || 0}</div>
              <div className="text-sm text-muted-foreground">Сданы</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">{statusData.find(s => s.name === 'Завершены')?.value || 0}</div>
              <div className="text-sm text-muted-foreground">Завершены</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}