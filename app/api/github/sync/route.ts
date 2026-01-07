import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { File } from '@/models/types';
import { ObjectId } from 'mongodb';

interface GitHubTreeItem {
  path: string;
  mode: '100644' | '100755' | '040000' | '160000' | '120000';
  type: 'blob' | 'tree' | 'commit';
  content?: string;
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

    const { repositoryName, repositoryOwner } = await request.json();

    if (!repositoryName || !repositoryOwner) {
      return NextResponse.json(
        { error: 'Repository name and owner are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Get all files for the user
    const files = await db.collection<File>('files')
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    // Build GitHub tree structure
    const tree: GitHubTreeItem[] = [];

    // Add all files
    for (const file of files) {
      tree.push({
        path: file.path.startsWith('/') ? file.path.slice(1) : file.path,
        mode: '100644',
        type: 'blob',
        content: file.content,
      });
    }

    // Create the tree in GitHub
    const githubToken = session.user.githubAccessToken;
    
    // Get the default branch and latest commit
    const repoResponse = await fetch(
      `https://api.github.com/repos/${repositoryOwner}/${repositoryName}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!repoResponse.ok) {
      const errorData = await repoResponse.json();
      return NextResponse.json(
        { error: 'Failed to fetch repository', details: errorData },
        { status: repoResponse.status }
      );
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Get the latest commit SHA
    const branchResponse = await fetch(
      `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/refs/heads/${defaultBranch}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let baseTreeSha: string | undefined;
    if (branchResponse.ok) {
      const branchData = await branchResponse.json();
      const commitSha = branchData.object.sha;
      
      // Get the commit to find the tree
      const commitResponse = await fetch(
        `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/commits/${commitSha}`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (commitResponse.ok) {
        const commitData = await commitResponse.json();
        baseTreeSha = commitData.tree.sha;
      }
    }

    // Create a new tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tree,
          base_tree: baseTreeSha,
        }),
      }
    );

    if (!treeResponse.ok) {
      const errorData = await treeResponse.json();
      return NextResponse.json(
        { error: 'Failed to create tree', details: errorData },
        { status: treeResponse.status }
      );
    }

    const treeData = await treeResponse.json();

    // Create a new commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Sync from mark-it-down - ${new Date().toISOString()}`,
          tree: treeData.sha,
          parents: baseTreeSha ? [await getLatestCommitSha(githubToken, repositoryOwner, repositoryName, defaultBranch)] : [],
        }),
      }
    );

    if (!commitResponse.ok) {
      const errorData = await commitResponse.json();
      return NextResponse.json(
        { error: 'Failed to create commit', details: errorData },
        { status: commitResponse.status }
      );
    }

    const commitData = await commitResponse.json();

    // Update the reference
    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/refs/heads/${defaultBranch}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sha: commitData.sha,
          force: false,
        }),
      }
    );

    if (!updateRefResponse.ok) {
      const errorData = await updateRefResponse.json();
      return NextResponse.json(
        { error: 'Failed to update reference', details: errorData },
        { status: updateRefResponse.status }
      );
    }

    return NextResponse.json({
      message: 'Files synced successfully',
      commitSha: commitData.sha,
      filesCount: files.length,
    });
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
    return NextResponse.json(
      { error: 'Failed to sync to GitHub' },
      { status: 500 }
    );
  }
}

async function getLatestCommitSha(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );
  
  const data = await response.json();
  return data.object.sha;
}
