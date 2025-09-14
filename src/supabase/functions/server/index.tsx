import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_utils.tsx';

const app = new Hono();

// CORS and logging middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Authentication routes
app.post('/make-server-8e756be3/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      // Check for specific error types
      if (error.message.includes('already been registered')) {
        return c.json({ error: 'A user with this email address has already been registered' }, 409);
      }
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup server error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Projects routes
app.get('/make-server-8e756be3/projects', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('Get projects - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const accessToken = authHeader?.split(' ')[1];
    console.log('Get projects - access token present:', !!accessToken);
    console.log('Get projects - token preview:', accessToken ? accessToken.substring(0, 20) + '...' : 'No token');
    
    if (!accessToken) {
      console.log('No access token provided');
      return c.json({ error: 'No access token provided' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    console.log('Get projects - auth check:', { 
      userId: user?.id, 
      userEmail: user?.email,
      authError: authError?.message,
      authErrorCode: authError?.status
    });
    
    if (authError || !user?.id) {
      console.log('Authorization failed for get projects:', authError?.message, authError?.status);
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    console.log(`Fetching projects for user: ${user.id}`);
    const userProjects = await kv.getByPrefixWithKeys(`user:${user.id}:projects:`);
    console.log(`Found ${userProjects.length} project entries for user ${user.id}`);
    
    const projects = userProjects.map(item => {
      try {
        // Check if value is already an object or needs parsing
        if (typeof item.value === 'string') {
          return JSON.parse(item.value);
        } else {
          return item.value;
        }
      } catch (parseError) {
        console.error('Error parsing project data:', parseError, 'Raw value:', item.value);
        return null;
      }
    }).filter(project => project !== null);
    
    console.log(`Returning ${projects.length} valid projects`);
    return c.json({ projects });
  } catch (error) {
    console.log('Get projects error:', error);
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to fetch projects: ' + (error instanceof Error ? error.message : String(error)) }, 500);
  }
});

app.post('/make-server-8e756be3/projects', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log('Create project - authorization failed:', authError?.message);
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    const projectData = await c.req.json();
    console.log('Creating project for user:', user.id, 'Project data:', projectData);
    
    const projectId = Date.now().toString();
    const project = {
      ...projectData,
      id: projectId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const projectKey = `user:${user.id}:projects:${projectId}`;
    console.log('Storing project with key:', projectKey);
    
    await kv.set(projectKey, project); // Store as object, not JSON string
    console.log('Project stored successfully');
    
    return c.json({ project });
  } catch (error) {
    console.log('Create project error:', error);
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to create project: ' + (error instanceof Error ? error.message : String(error)) }, 500);
  }
});

app.put('/make-server-8e756be3/projects/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log('Update project - authorization failed:', authError?.message);
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    const projectId = c.req.param('id');
    const projectData = await c.req.json();
    console.log('Updating project:', projectId, 'for user:', user.id);
    
    const updatedProject = {
      ...projectData,
      id: projectId,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:projects:${projectId}`, updatedProject); // Store as object
    console.log('Project updated successfully');
    
    return c.json({ project: updatedProject });
  } catch (error) {
    console.log('Update project error:', error);
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to update project: ' + (error instanceof Error ? error.message : String(error)) }, 500);
  }
});

app.delete('/make-server-8e756be3/projects/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    const projectId = c.req.param('id');
    await kv.del(`user:${user.id}:projects:${projectId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete project error:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// Teams routes
app.get('/make-server-8e756be3/teams', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log('Get teams - authorization failed:', authError?.message);
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    console.log(`Fetching teams for user: ${user.id}`);
    // Get all teams where user is a member
    const userTeams = await kv.getByPrefixWithKeys(`user:${user.id}:teams:`);
    console.log(`Found ${userTeams.length} team memberships for user ${user.id}`);
    
    const teamIds = userTeams.map(item => item.key.split(':')[3]);
    console.log('Team IDs:', teamIds);
    
    const teams = [];
    for (const teamId of teamIds) {
      const teamData = await kv.get(`team:${teamId}`);
      if (teamData) {
        let team;
        // Check if teamData is already an object or needs parsing
        if (typeof teamData === 'string') {
          team = JSON.parse(teamData);
        } else {
          team = teamData;
        }
        
        // Check if user is owner or member
        team.isOwner = team.ownerId === user.id;
        team.isMember = true;
        teams.push(team);
      }
    }
    
    console.log(`Returning ${teams.length} teams`);
    return c.json({ teams });
  } catch (error) {
    console.log('Get teams error:', error);
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to fetch teams: ' + (error instanceof Error ? error.message : String(error)) }, 500);
  }
});

app.post('/make-server-8e756be3/teams', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log('Create team - authorization failed:', authError?.message);
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    const { name, description } = await c.req.json();
    console.log('Creating team for user:', user.id, 'Team name:', name);
    
    const teamId = Date.now().toString();
    const team = {
      id: teamId,
      name,
      description,
      ownerId: user.id,
      ownerEmail: user.email,
      createdAt: new Date().toISOString(),
      memberCount: 1,
      isOwner: true,
      isMember: true,
    };

    // Save team data
    await kv.set(`team:${teamId}`, team); // Store as object
    
    // Add user as team member
    await kv.set(`user:${user.id}:teams:${teamId}`, {
      teamId,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    }); // Store as object
    
    console.log('Team created successfully:', teamId);
    return c.json({ team });
  } catch (error) {
    console.log('Create team error:', error);
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to create team: ' + (error instanceof Error ? error.message : String(error)) }, 500);
  }
});

app.post('/make-server-8e756be3/teams/join', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log('Join team - authorization failed:', authError?.message);
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    const { teamId } = await c.req.json();
    console.log('User', user.id, 'attempting to join team:', teamId);
    
    // Check if team exists
    const teamData = await kv.get(`team:${teamId}`);
    if (!teamData) {
      console.log('Team not found:', teamId);
      return c.json({ error: 'Team not found' }, 404);
    }

    let team;
    // Check if teamData is already an object or needs parsing
    if (typeof teamData === 'string') {
      team = JSON.parse(teamData);
    } else {
      team = teamData;
    }
    
    // Check if user is already a member
    const existingMembership = await kv.get(`user:${user.id}:teams:${teamId}`);
    if (existingMembership) {
      console.log('User already a member of team:', teamId);
      return c.json({ error: 'You are already a member of this team' }, 400);
    }

    // Add user as team member
    await kv.set(`user:${user.id}:teams:${teamId}`, {
      teamId,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }); // Store as object
    
    // Update team member count
    team.memberCount = (team.memberCount || 1) + 1;
    await kv.set(`team:${teamId}`, team); // Store as object
    
    console.log('User successfully joined team:', teamId);
    return c.json({ success: true });
  } catch (error) {
    console.log('Join team error:', error);
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to join team: ' + (error instanceof Error ? error.message : String(error)) }, 500);
  }
});

// User profile routes
app.get('/make-server-8e756be3/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    const profileData = await kv.get(`user:${user.id}:profile`);
    let profile;
    
    if (profileData) {
      profile = JSON.parse(profileData);
    } else {
      // Create default profile
      profile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        title: '',
        department: '',
        notifications: {
          email: true,
          push: true,
          desktop: false,
        },
        theme: 'light',
        language: 'ru',
        timezone: 'Europe/Moscow',
      };
      await kv.set(`user:${user.id}:profile`, JSON.stringify(profile));
    }
    
    return c.json({ profile });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.put('/make-server-8e756be3/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized - failed to get user from token' }, 401);
    }

    const profileData = await c.req.json();
    const profile = {
      ...profileData,
      id: user.id,
      email: user.email, // Don't allow email change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:profile`, JSON.stringify(profile));
    
    return c.json({ profile });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Health check
app.get('/make-server-8e756be3/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route for testing
app.get('/', (c) => {
  return c.json({ message: 'ПРО ПРИОРИТЕТ Server is running', timestamp: new Date().toISOString() });
});

// Log server startup
console.log('Starting ПРО ПРИОРИТЕТ server...');
console.log('Environment check:');
console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'Not set');

Deno.serve(app.fetch);