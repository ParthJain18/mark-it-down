'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileExplorer } from '@/components/file-explorer';
import { RichTextEditor } from '@/components/rich-text-editor';
import { GitHubSync } from '@/components/github-sync';
import { LogOut, Clock } from 'lucide-react';

interface FileItem {
  _id: string;
  name: string;
  content: string;
  type: string;
  folderId?: string | null;
  path: string;
}

interface FolderItem {
  _id: string;
  name: string;
  parentId?: string | null;
  path: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    const loadData = async () => {
      try {
        const [foldersRes, filesRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/files')
        ]);

        const [foldersData, filesData] = await Promise.all([
          foldersRes.json(),
          filesRes.json()
        ]);

        if (foldersRes.ok) {
          setFolders(foldersData.folders);
        }

        if (filesRes.ok) {
          setFiles(filesData.files);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    void loadData();
  }, [status, router]);

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      const data = await response.json();
      if (response.ok) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (response.ok) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    setEditContent(file.content);
  };

  const handleFileCreate = async (name: string, folderId: string | null) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: 'text',
          content: '',
          folderId,
        }),
      });

      if (response.ok) {
        await fetchFiles();
      }
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (selectedFile?._id === fileId) {
          setSelectedFile(null);
          setEditContent('');
        }
        await fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileRename = async (fileId: string, newName: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fileId,
          name: newName,
        }),
      });

      if (response.ok) {
        await fetchFiles();
        if (selectedFile?._id === fileId) {
          setSelectedFile({ ...selectedFile, name: newName });
        }
      }
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleFolderCreate = async (name: string, parentId: string | null) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId,
        }),
      });

      if (response.ok) {
        await fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;

    try {
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFolders();
        await fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleFolderRename = async (folderId: string, newName: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: folderId,
          name: newName,
        }),
      });

      if (response.ok) {
        await fetchFolders();
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  const handleSave = async (content: string) => {
    if (!selectedFile) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFile._id,
          content,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        setSelectedFile({ ...selectedFile, content });
        await fetchFiles();
      }
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">MarkItDown</h1>
          {selectedFile && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <span className="text-gray-400 dark:text-gray-600">/</span>
              <span>{selectedFile.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-xl text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-500">{session.user?.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 h-8"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* File Explorer Panel */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
          <FileExplorer
            files={files}
            folders={folders}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            onFolderCreate={handleFolderCreate}
            onFolderDelete={handleFolderDelete}
            onFolderRename={handleFolderRename}
          />
        </div>

        {/* Editor Panel */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-white dark:bg-gray-950">
            {selectedFile ? (
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                onSave={handleSave}
                fileName={selectedFile.name}
                placeholder={`Start writing in ${selectedFile.name}...`}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-600">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg font-medium">No file selected</p>
                  <p className="text-sm mt-2">Create or select a file from the explorer</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GitHub Sync Panel */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
          <GitHubSync />
        </div>
      </div>
    </div>
  );
}
