'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText,
    Folder,
    FolderOpen,
    FolderPlus,
    FilePlus,
    Trash2,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    Edit2,
    File,
    FileCode,
    FileJson,
    Image as ImageIcon,
} from 'lucide-react';

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

interface FileExplorerProps {
    files: FileItem[];
    folders: FolderItem[];
    selectedFile: FileItem | null;
    onFileSelect: (file: FileItem) => void;
    onFileCreate: (name: string, folderId: string | null) => void;
    onFileDelete: (fileId: string) => void;
    onFolderCreate: (name: string, parentId: string | null) => void;
    onFolderDelete: (folderId: string) => void;
    onFileRename: (fileId: string, newName: string) => void;
    onFolderRename: (folderId: string, newName: string) => void;
}

export function FileExplorer({
    files,
    folders,
    selectedFile,
    onFileSelect,
    onFileCreate,
    onFileDelete,
    onFolderCreate,
    onFolderDelete,
    onFileRename,
    onFolderRename,
}: FileExplorerProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [creatingFile, setCreatingFile] = useState<string | null>(null);
    const [creatingFolder, setCreatingFolder] = useState<string | null>(null);
    const [renamingItem, setRenamingItem] = useState<{ id: string; type: 'file' | 'folder' } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: any; type: 'file' | 'folder' } | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [creatingFile, creatingFolder, renamingItem]);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'md':
            case 'markdown':
                return <FileText className="w-4 h-4 text-blue-500" />;
            case 'json':
                return <FileJson className="w-4 h-4 text-yellow-600" />;
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
            case 'py':
            case 'java':
            case 'cpp':
            case 'c':
                return <FileCode className="w-4 h-4 text-green-600" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                return <ImageIcon className="w-4 h-4 text-purple-500" />;
            default:
                return <File className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleCreateFile = () => {
        if (newItemName.trim()) {
            onFileCreate(newItemName, creatingFile === '__root__' ? null : creatingFile);
            setNewItemName('');
            setCreatingFile('__none__');
        }
    };

    const handleCreateFolder = () => {
        if (newItemName.trim()) {
            onFolderCreate(newItemName, creatingFolder === '__root__' ? null : creatingFolder);
            setNewItemName('');
            setCreatingFolder('__none__');
        }
    };

    const handleRename = () => {
        if (newItemName.trim() && renamingItem) {
            if (renamingItem.type === 'file') {
                onFileRename(renamingItem.id, newItemName);
            } else {
                onFolderRename(renamingItem.id, newItemName);
            }
            setNewItemName('');
            setRenamingItem(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            action();
        } else if (e.key === 'Escape') {
            setCreatingFile(null);
            setCreatingFolder(null);
            setRenamingItem(null);
            setNewItemName('');
        }
    };

    const renderFolder = (folder: FolderItem, level: number = 0) => {
        const isExpanded = expandedFolders.has(folder._id);
        const childFolders = folders.filter((f) => f.parentId === folder._id);
        const childFiles = files.filter((f) => f.folderId === folder._id);

        return (
            <div key={folder._id}>
                <div
                    className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded group cursor-pointer"
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, item: folder, type: 'folder' });
                    }}
                >
                    <button
                        onClick={() => toggleFolder(folder._id)}
                        className="p-0 hover:bg-gray-200 rounded"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                    {renamingItem?.id === folder._id && renamingItem.type === 'folder' ? (
                        <Input
                            ref={inputRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, handleRename)}
                            onBlur={handleRename}
                            className="h-6 px-1 text-sm flex-1"
                        />
                    ) : (
                        <>
                            {isExpanded ? (
                                <FolderOpen className="w-4 h-4 text-yellow-600" />
                            ) : (
                                <Folder className="w-4 h-4 text-yellow-600" />
                            )}
                            <span className="text-sm flex-1" onClick={() => toggleFolder(folder._id)}>
                                {folder.name}
                            </span>
                        </>
                    )}
                </div>

                {isExpanded && (
                    <>
                        {childFolders.map((childFolder) => renderFolder(childFolder, level + 1))}
                        {childFiles.map((file) => renderFile(file, level + 1))}
                        {creatingFile === folder._id && (
                            <div
                                className="flex items-center gap-1 px-2 py-1"
                                style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                            >
                                <div className="w-4" />
                                <File className="w-4 h-4 text-gray-400" />
                                <Input
                                    ref={inputRef}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, handleCreateFile)}
                                    onBlur={handleCreateFile}
                                    placeholder="filename.ext"
                                    className="h-6 px-1 text-sm flex-1"
                                />
                            </div>
                        )}
                        {creatingFolder === folder._id && (
                            <div
                                className="flex items-center gap-1 px-2 py-1"
                                style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                            >
                                <div className="w-4" />
                                <Folder className="w-4 h-4 text-yellow-600" />
                                <Input
                                    ref={inputRef}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, handleCreateFolder)}
                                    onBlur={handleCreateFolder}
                                    placeholder="folder name"
                                    className="h-6 px-1 text-sm flex-1"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderFile = (file: FileItem, level: number = 0) => {
        const isSelected = selectedFile?._id === file._id;

        return (
            <div
                key={file._id}
                className={`flex items-center gap-1 px-2 py-1 rounded group cursor-pointer ${isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                    }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => onFileSelect(file)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, item: file, type: 'file' });
                }}
            >
                <div className="w-4" />
                {renamingItem?.id === file._id && renamingItem.type === 'file' ? (
                    <>
                        {getFileIcon(newItemName || file.name)}
                        <Input
                            ref={inputRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, handleRename)}
                            onBlur={handleRename}
                            className="h-6 px-1 text-sm flex-1"
                        />
                    </>
                ) : (
                    <>
                        {getFileIcon(file.name)}
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                    </>
                )}
            </div>
        );
    };

    const rootFolders = folders.filter((f) => !f.parentId);
    const rootFiles = files.filter((f) => !f.folderId);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">EXPLORER</span>
                <div className="flex gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => {
                            setCreatingFile('__root__');
                            setCreatingFolder('__none__');
                        }}
                        title="New File"
                    >
                        <FilePlus className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => {
                            setCreatingFolder('__root__');
                            setCreatingFile('__none__');
                        }}
                        title="New Folder"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto py-1">
                {creatingFile === '__root__' && (
                    <div className="flex items-center gap-1 px-2 py-1">
                        <div className="w-4" />
                        <File className="w-4 h-4 text-gray-400" />
                        <Input
                            ref={inputRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, handleCreateFile)}
                            onBlur={() => {
                                if (newItemName.trim()) handleCreateFile();
                                else setCreatingFile('__none__');
                            }}
                            placeholder="filename.ext"
                            className="h-6 px-1 text-sm flex-1"
                        />
                    </div>
                )}
                {creatingFolder === '__root__' && (
                    <div className="flex items-center gap-1 px-2 py-1">
                        <div className="w-4" />
                        <Folder className="w-4 h-4 text-yellow-600" />
                        <Input
                            ref={inputRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, handleCreateFolder)}
                            onBlur={() => {
                                if (newItemName.trim()) handleCreateFolder();
                                else setCreatingFolder('__none__');
                            }}
                            placeholder="folder name"
                            className="h-6 px-1 text-sm flex-1"
                        />
                    </div>
                )}
                {rootFolders.map((folder) => renderFolder(folder))}
                {rootFiles.map((file) => renderFile(file))}
                {creatingFile === null && (
                    <div className="flex items-center gap-1 px-2 py-1">
                        <div className="w-4" />
                        <File className="w-4 h-4 text-gray-400" />
                        <Input
                            ref={inputRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, handleCreateFile)}
                            onBlur={() => {
                                if (newItemName.trim()) handleCreateFile();
                                else setCreatingFile('__none__');
                            }}
                            placeholder="filename.ext"
                            className="h-6 px-1 text-sm flex-1"
                        />
                    </div>
                )}
                {creatingFolder === null && (
                    <div className="flex items-center gap-1 px-2 py-1">
                        <div className="w-4" />
                        <Folder className="w-4 h-4 text-yellow-600" />
                        <Input
                            ref={inputRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, handleCreateFolder)}
                            onBlur={() => {
                                if (newItemName.trim()) handleCreateFolder();
                                else setCreatingFolder('__none__');
                            }}
                            placeholder="folder name"
                            className="h-6 px-1 text-sm flex-1"
                        />
                    </div>
                )}
                {rootFolders.length === 0 && rootFiles.length === 0 && creatingFile !== '__root__' && creatingFolder !== '__root__' && (
                    <div className="text-center py-8 text-sm text-gray-500">
                        No files yet
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-white border border-gray-200 rounded shadow-lg py-1 z-50"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="w-full px-4 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                            if (contextMenu.type === 'file') {
                                setRenamingItem({ id: contextMenu.item._id, type: 'file' });
                                setNewItemName(contextMenu.item.name);
                            } else {
                                setRenamingItem({ id: contextMenu.item._id, type: 'folder' });
                                setNewItemName(contextMenu.item.name);
                            }
                            setContextMenu(null);
                        }}
                    >
                        <Edit2 className="w-3 h-3" />
                        Rename
                    </button>
                    <button
                        className="w-full px-4 py-1.5 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                        onClick={() => {
                            if (contextMenu.type === 'file') {
                                onFileDelete(contextMenu.item._id);
                            } else {
                                onFolderDelete(contextMenu.item._id);
                            }
                            setContextMenu(null);
                        }}
                    >
                        <Trash2 className="w-3 h-3" />
                        Delete
                    </button>
                    {contextMenu.type === 'folder' && (
                        <>
                            <div className="border-t border-gray-200 my-1" />
                            <button
                                className="w-full px-4 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                onClick={() => {
                                    setCreatingFile(contextMenu.item._id);
                                    setExpandedFolders(new Set([...expandedFolders, contextMenu.item._id]));
                                    setContextMenu(null);
                                }}
                            >
                                <FilePlus className="w-3 h-3" />
                                New File
                            </button>
                            <button
                                className="w-full px-4 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                onClick={() => {
                                    setCreatingFolder(contextMenu.item._id);
                                    setExpandedFolders(new Set([...expandedFolders, contextMenu.item._id]));
                                    setContextMenu(null);
                                }}
                            >
                                <FolderPlus className="w-3 h-3" />
                                New Folder
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
