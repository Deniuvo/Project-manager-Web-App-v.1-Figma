import { useState, useEffect } from "react";
import { Team, CreateTeamData } from "../types/team";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Users, Plus, Search, Crown, Settings, UserPlus } from "lucide-react";
import { apiClient } from "../utils/api";

interface TeamTabProps {
  accessToken: string;
  userEmail: string;
}

export function TeamTab({ accessToken, userEmail }: TeamTabProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTeam, setNewTeam] = useState<CreateTeamData>({ name: "", description: "" });
  const [joinTeamId, setJoinTeamId] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.getTeams(accessToken);
      if (result.data) {
        setTeams(result.data.teams);
      } else {
        console.error('Failed to load teams:', result.error);
        // Fallback to localStorage
        const localTeams = localStorage.getItem(`teams_${userEmail}`);
        if (localTeams) {
          setTeams(JSON.parse(localTeams));
        }
      }
    } catch (error) {
      console.error('Load teams error:', error);
      // Fallback to localStorage
      const localTeams = localStorage.getItem(`teams_${userEmail}`);
      if (localTeams) {
        setTeams(JSON.parse(localTeams));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return;

    try {
      const result = await apiClient.createTeam(newTeam, accessToken);
      if (result.data) {
        const updatedTeams = [...teams, result.data.team];
        setTeams(updatedTeams);
        localStorage.setItem(`teams_${userEmail}`, JSON.stringify(updatedTeams));
        setIsCreateDialogOpen(false);
        setNewTeam({ name: "", description: "" });
      } else {
        console.error('Failed to create team:', result.error);
        // Fallback to local storage
        const localTeam: Team = {
          id: Date.now().toString(),
          name: newTeam.name,
          description: newTeam.description,
          ownerId: userEmail,
          ownerEmail: userEmail,
          createdAt: new Date().toISOString(),
          memberCount: 1,
          isOwner: true,
          isMember: true,
        };
        const updatedTeams = [...teams, localTeam];
        setTeams(updatedTeams);
        localStorage.setItem(`teams_${userEmail}`, JSON.stringify(updatedTeams));
        setIsCreateDialogOpen(false);
        setNewTeam({ name: "", description: "" });
      }
    } catch (error) {
      console.error('Create team error:', error);
      // Fallback to local storage
      const localTeam: Team = {
        id: Date.now().toString(),
        name: newTeam.name,
        description: newTeam.description,
        ownerId: userEmail,
        ownerEmail: userEmail,
        createdAt: new Date().toISOString(),
        memberCount: 1,
        isOwner: true,
        isMember: true,
      };
      const updatedTeams = [...teams, localTeam];
      setTeams(updatedTeams);
      localStorage.setItem(`teams_${userEmail}`, JSON.stringify(updatedTeams));
      setIsCreateDialogOpen(false);
      setNewTeam({ name: "", description: "" });
    }
  };

  const handleJoinTeam = async () => {
    if (!joinTeamId.trim()) return;

    try {
      const result = await apiClient.joinTeam({ teamId: joinTeamId }, accessToken);
      if (result.data) {
        await loadTeams(); // Reload teams to get updated list
        setIsJoinDialogOpen(false);
        setJoinTeamId("");
      } else {
        console.error('Failed to join team:', result.error);
      }
    } catch (error) {
      console.error('Join team error:', error);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6">Команда</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1>Команда</h1>
        <div className="flex gap-3">
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Присоединиться
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Присоединиться к команде</DialogTitle>
                <DialogDescription>
                  Введите ID команды, чтобы отправить запрос на присоединение.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamId">ID команды</Label>
                  <Input
                    id="teamId"
                    value={joinTeamId}
                    onChange={(e) => setJoinTeamId(e.target.value)}
                    placeholder="Введите ID команды"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsJoinDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleJoinTeam}>
                    Присоединиться
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Создать команду
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новую команду</DialogTitle>
                <DialogDescription>
                  Создайте команду для совместной работы над проектами.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Название команды</Label>
                  <Input
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="Введите название команды"
                  />
                </div>
                <div>
                  <Label htmlFor="teamDescription">Описание (необязательно)</Label>
                  <Textarea
                    id="teamDescription"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="Краткое описание команды"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleCreateTeam}>
                    Создать
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск команд..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="mb-2">Команды не найдены</h3>
            <p className="text-muted-foreground text-center mb-4">
              {teams.length === 0 
                ? "У вас пока нет команд. Создайте новую команду или присоединитесь к существующей."
                : "Команды не найдены по вашему запросу."
              }
            </p>
            {teams.length === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Создать первую команду
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {team.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {team.name}
                        {team.isOwner && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {team.description || "Описание отсутствует"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={team.isMember ? "default" : "secondary"}>
                      {team.isMember ? "Участник" : "Доступна"}
                    </Badge>
                    {team.isOwner && (
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {team.memberCount} участник{team.memberCount === 1 ? '' : team.memberCount < 5 ? 'а' : 'ов'}
                    </div>
                    <div>
                      Создана {new Date(team.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {team.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}