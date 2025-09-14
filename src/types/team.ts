export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerEmail: string;
  createdAt: string;
  memberCount: number;
  isOwner?: boolean;
  isMember?: boolean;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userEmail: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  title?: string;
  department?: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en';
  timezone: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface JoinTeamData {
  teamId: string;
  inviteCode?: string;
}