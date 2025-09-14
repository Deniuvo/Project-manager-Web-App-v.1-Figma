import { projectId, publicAnonKey } from './supabase/info';
import { Project } from '../components/ProjectCard';
import { Team, CreateTeamData, JoinTeamData, UserProfile } from '../types/team';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8e756be3`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private getHeaders(accessToken?: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    };
  }

  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    try {
      console.log('Health check URL:', `${API_BASE_URL}/health`);
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      console.log('Health check response:', data);
      
      if (!response.ok) {
        return { error: 'Health check failed' };
      }

      return { data };
    } catch (error) {
      console.error('Health check error:', error);
      return { error: 'Health check network error: ' + (error instanceof Error ? error.message : String(error)) };
    }
  }

  async signup(email: string, password: string, name: string): Promise<ApiResponse<{ user: any }>> {
    try {
      console.log('Making signup request to:', `${API_BASE_URL}/signup`);
      console.log('Request payload:', { email, name }); // Don't log password
      
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password, name }),
      });

      console.log('Signup response status:', response.status);

      const data = await response.json();
      console.log('Signup response data:', data);
      
      if (!response.ok) {
        console.error('Signup API error:', data);
        return { error: data.error || 'Signup failed' };
      }

      return { data };
    } catch (error) {
      console.error('Signup network error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      return { error: 'Network error during signup: ' + (error instanceof Error ? error.message : String(error)) };
    }
  }

  async getProjects(accessToken: string): Promise<ApiResponse<{ projects: Project[] }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Get projects API error:', data);
        return { error: data.error || 'Failed to fetch projects' };
      }

      return { data };
    } catch (error) {
      console.error('Get projects network error:', error);
      return { error: 'Network error while fetching projects' };
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'userId'>, accessToken: string): Promise<ApiResponse<{ project: Project }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Create project API error:', data);
        return { error: data.error || 'Failed to create project' };
      }

      return { data };
    } catch (error) {
      console.error('Create project network error:', error);
      return { error: 'Network error while creating project' };
    }
  }

  async updateProject(projectId: string, projectData: Partial<Project>, accessToken: string): Promise<ApiResponse<{ project: Project }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Update project API error:', data);
        return { error: data.error || 'Failed to update project' };
      }

      return { data };
    } catch (error) {
      console.error('Update project network error:', error);
      return { error: 'Network error while updating project' };
    }
  }

  async deleteProject(projectId: string, accessToken: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getHeaders(accessToken),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Delete project API error:', data);
        return { error: data.error || 'Failed to delete project' };
      }

      return { data };
    } catch (error) {
      console.error('Delete project network error:', error);
      return { error: 'Network error while deleting project' };
    }
  }

  // Team methods
  async getTeams(accessToken: string): Promise<ApiResponse<{ teams: Team[] }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Get teams API error:', data);
        return { error: data.error || 'Failed to fetch teams' };
      }

      return { data };
    } catch (error) {
      console.error('Get teams network error:', error);
      return { error: 'Network error while fetching teams' };
    }
  }

  async createTeam(teamData: CreateTeamData, accessToken: string): Promise<ApiResponse<{ team: Team }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(teamData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Create team API error:', data);
        return { error: data.error || 'Failed to create team' };
      }

      return { data };
    } catch (error) {
      console.error('Create team network error:', error);
      return { error: 'Network error while creating team' };
    }
  }

  async joinTeam(joinData: JoinTeamData, accessToken: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/join`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(joinData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Join team API error:', data);
        return { error: data.error || 'Failed to join team' };
      }

      return { data };
    } catch (error) {
      console.error('Join team network error:', error);
      return { error: 'Network error while joining team' };
    }
  }

  // User profile methods
  async getUserProfile(accessToken: string): Promise<ApiResponse<{ profile: UserProfile }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Get profile API error:', data);
        return { error: data.error || 'Failed to fetch profile' };
      }

      return { data };
    } catch (error) {
      console.error('Get profile network error:', error);
      return { error: 'Network error while fetching profile' };
    }
  }

  async updateUserProfile(profileData: UserProfile, accessToken: string): Promise<ApiResponse<{ profile: UserProfile }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Update profile API error:', data);
        return { error: data.error || 'Failed to update profile' };
      }

      return { data };
    } catch (error) {
      console.error('Update profile network error:', error);
      return { error: 'Network error while updating profile' };
    }
  }
}

export const apiClient = new ApiClient();