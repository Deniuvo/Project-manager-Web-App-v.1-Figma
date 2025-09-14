import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Project } from "./ProjectCard";
import { TrendingUp, Users, Clock, CheckCircle } from "lucide-react";

interface DashboardTabProps {
  projects: Project[];
}

export function DashboardTab({ projects }: DashboardTabProps) {
  const getStatusStats = () => {
    const stats = [
      { name: 'Запланировано', value: projects.filter(p => p.status === 'planned').length, color: '#3b82f6' },
      { name: 'В работе', value: projects.filter(p => p.status === 'in-progress').length, color: '#f97316' },
      { name: 'Сдано', value: projects.filter(p => p.status === 'submitted').length, color: '#8b5cf6' },
      { name: 'На оценке', value: projects.filter(p => p.status === 'waiting-review').length, color: '#eab308' },
      { name: 'Завершено', value: projects.filter(p => p.status === 'completed').length, color: '#22c55e' },
    ];
    return stats;
  };

  const getRecentProjects = () => {
    return projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getOverviewStats = () => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const overdue = projects.filter(p => {
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      return dueDate < today && p.status !== 'completed';
    }).length;

    return { total, completed, inProgress, overdue };
  };

  const statusData = getStatusStats();
  const recentProjects = getRecentProjects();
  const overviewStats = getOverviewStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Обзор</h1>
        <p className="text-muted-foreground mt-1">Общая статистика по проектам</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего проектов</p>
                <p className="text-2xl font-medium">{overviewStats.total}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">В работе</p>
                <p className="text-2xl font-medium">{overviewStats.inProgress}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Завершено</p>
                <p className="text-2xl font-medium">{overviewStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просрочено</p>
                <p className="text-2xl font-medium">{overviewStats.overdue}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
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
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика проектов</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Последние проекты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">{project.title}</h4>
                  <p className="text-sm text-muted-foreground">{project.assignee}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-2 py-1 rounded text-xs ${
                    project.status === 'completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {project.status === 'planned' && 'Запланировано'}
                    {project.status === 'in-progress' && 'В работе'}
                    {project.status === 'submitted' && 'Сдано'}
                    {project.status === 'waiting-review' && 'На оценке'}
                    {project.status === 'completed' && 'Завершено'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(project.dueDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Пока нет проектов
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}