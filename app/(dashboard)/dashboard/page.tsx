'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Folder, FolderPlus, FilePlus, Trash2, LogOut, Save } from 'lucide-react';

interface FileItem {
  _id: string;
  name: string;
  content: string;
  type: 'markdown' | 'text';
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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'markdown' | 'text'>('markdown');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFolders();
      fetchFiles();
    }
  }, [status]);

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

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          parentId: selectedFolder,
        }),
      });

      if (response.ok) {
        setNewFolderName('');
        setShowNewFolder(false);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const createFile = async () => {
    if (!newFileName.trim()) return;

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFileName,
          type: newFileType,
          content: '',
          folderId: selectedFolder,
        }),
      });

      if (response.ok) {
        setNewFileName('');
        setShowNewFile(false);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;

    try {
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFolders();
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (selectedFile?._id === fileId) {
          setSelectedFile(null);
          setIsEditing(false);
        }
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFile._id,
          content: editContent,
        }),
      });

      if (response.ok) {
        setSelectedFile({ ...selectedFile, content: editContent });
        setIsEditing(false);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const openFile = (file: FileItem) => {
    setSelectedFile(file);
    setEditContent(file.content);
    setIsEditing(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentFolderFiles = files.filter(
    (f) => (f.folderId || null) === selectedFolder
  );
  const currentFolderSubfolders = folders.filter(
    (f) => (f.parentId || null) === selectedFolder
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Markdown Hosting</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar - File Explorer */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Files & Folders</span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowNewFolder(!showNewFolder)}
                      title="New Folder"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowNewFile(!showNewFile)}
                      title="New File"
                    >
                      <FilePlus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showNewFolder && (
                  <div className="mb-4 p-3 bg-gray-50 rounded space-y-2">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={createFolder}>Create</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowNewFolder(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {showNewFile && (
                  <div className="mb-4 p-3 bg-gray-50 rounded space-y-2">
                    <Input
                      placeholder="File name"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createFile()}
                    />
                    <div className="flex gap-2">
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        value={newFileType}
                        onChange={(e) => setNewFileType(e.target.value as 'markdown' | 'text')}
                      >
                        <option value="markdown">Markdown</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={createFile}>Create</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowNewFile(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {selectedFolder && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedFolder(null)}
                    >
                      ← Back
                    </Button>
                  )}

                  {currentFolderSubfolders.map((folder) => (
                    <div key={folder._id} className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start text-sm"
                        onClick={() => setSelectedFolder(folder._id)}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {folder.name}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteFolder(folder._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  {currentFolderFiles.map((file) => (
                    <div key={file._id} className="flex items-center gap-2">
                      <Button
                        variant={selectedFile?._id === file._id ? "secondary" : "ghost"}
                        className="flex-1 justify-start text-sm"
                        onClick={() => openFile(file)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteFile(file._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  {currentFolderSubfolders.length === 0 && currentFolderFiles.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No files or folders yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedFile ? (
                    <>
                      <span>{selectedFile.name}</span>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={saveFile}>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                setEditContent(selectedFile.content);
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => setIsEditing(true)}>
                            Edit
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <span>Select a file or create a new one</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFile ? (
                  isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[500px] font-mono"
                      placeholder="Start writing..."
                    />
                  ) : (
                    <div className="prose max-w-none">
                      {selectedFile.type === 'markdown' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedFile.content || '*No content yet*'}
                        </ReactMarkdown>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-sm">
                          {selectedFile.content || 'No content yet'}
                        </pre>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-gray-500">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No file selected</p>
                      <p className="text-sm">Create or select a file to get started</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
