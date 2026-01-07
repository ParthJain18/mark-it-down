'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Github, RefreshCw, Plus, Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string;
  url: string;
}

export function GitHubSync() {
  const { data: session } = useSession();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const hasGitHubAuth = !!session?.user?.githubAccessToken;

  useEffect(() => {
    if (hasGitHubAuth) {
      fetchRepositories();
    }
  }, [hasGitHubAuth]);

  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/github/repos');
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories);
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedRepo) {
      setSyncStatus('error');
      setSyncMessage('Please select a repository');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      const [owner, name] = selectedRepo.split('/');
      
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryOwner: owner,
          repositoryName: name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus('success');
        setSyncMessage(`Successfully synced ${data.filesCount} files to GitHub!`);
      } else {
        setSyncStatus('error');
        setSyncMessage(data.error || 'Failed to sync to GitHub');
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('An error occurred while syncing');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateRepository = async () => {
    if (!newRepoName) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/github/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRepoName,
          description: newRepoDescription,
          isPrivate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRepositories([data.repository, ...repositories]);
        setSelectedRepo(`${data.repository.owner}/${data.repository.name}`);
        setShowCreateDialog(false);
        setNewRepoName('');
        setNewRepoDescription('');
        setIsPrivate(false);
      }
    } catch (error) {
      console.error('Error creating repository:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasGitHubAuth) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Github className="h-5 w-5" />
          <h3 className="font-semibold">GitHub Sync</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your GitHub account to sync your files to a repository.
        </p>
        <Button
          onClick={() => window.location.href = '/api/auth/signin'}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Github className="mr-2 h-4 w-4" />
          Connect GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Github className="h-5 w-5" />
          <h3 className="font-semibold">GitHub Sync</h3>
        </div>
        <Button
          onClick={fetchRepositories}
          variant="ghost"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="repository" className="text-sm">
            Select Repository
          </Label>
          <div className="flex gap-2 mt-1">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger id="repository">
                <SelectValue placeholder="Choose a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.fullName}>
                    {repo.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Repository</DialogTitle>
                  <DialogDescription>
                    Create a new GitHub repository to sync your files.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="repo-name">Repository Name</Label>
                    <Input
                      id="repo-name"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="my-markdown-files"
                    />
                  </div>
                  <div>
                    <Label htmlFor="repo-description">Description (Optional)</Label>
                    <Input
                      id="repo-description"
                      value={newRepoDescription}
                      onChange={(e) => setNewRepoDescription(e.target.value)}
                      placeholder="My markdown files from mark-it-down"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-private"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is-private">Private Repository</Label>
                  </div>
                  <Button
                    onClick={handleCreateRepository}
                    disabled={!newRepoName || isLoading}
                    className="w-full"
                  >
                    Create Repository
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={!selectedRepo || isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Github className="mr-2 h-4 w-4" />
              Sync to GitHub
            </>
          )}
        </Button>

        {syncStatus !== 'idle' && (
          <div
            className={`flex items-start gap-2 p-3 rounded-md text-sm ${
              syncStatus === 'success'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {syncStatus === 'success' ? (
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{syncMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
