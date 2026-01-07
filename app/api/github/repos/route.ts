import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.githubAccessToken) {
      return NextResponse.json(
        { error: 'GitHub authentication required' },
        { status: 401 }
      );
    }

    const githubToken = session.user.githubAccessToken;

    // Fetch user's repositories
    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100',
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: response.status }
      );
    }

    const repos = await response.json();
    
    return NextResponse.json({
      repositories: repos.map((repo: { 
        id: number;
        name: string;
        full_name: string;
        owner: { login: string };
        private: boolean;
        description: string;
        html_url: string;
      }) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        private: repo.private,
        description: repo.description,
        url: repo.html_url,
      }))
    });
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.githubAccessToken) {
      return NextResponse.json(
        { error: 'GitHub authentication required' },
        { status: 401 }
      );
    }

    const { name, description, isPrivate } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Repository name is required' },
        { status: 400 }
      );
    }

    const githubToken = session.user.githubAccessToken;

    // Create a new repository
    const response = await fetch(
      'https://api.github.com/user/repos',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || 'Synced from mark-it-down',
          private: isPrivate || false,
          auto_init: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to create repository', details: errorData },
        { status: response.status }
      );
    }

    const repo = await response.json();

    return NextResponse.json({
      repository: {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        private: repo.private,
        description: repo.description,
        url: repo.html_url,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating GitHub repository:', error);
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    );
  }
}
