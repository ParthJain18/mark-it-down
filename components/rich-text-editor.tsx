'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useDebounce } from 'use-debounce';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    onSave: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
    fileName?: string;
}

export function RichTextEditor({
    content,
    onChange,
    onSave,
    placeholder = 'Start writing...',
    editable = true,
    fileName = '',
}: RichTextEditorProps) {
    const [debouncedContent] = useDebounce(content, 2000);
    const lastSavedContent = useRef(content);

    const isMarkdown = fileName.toLowerCase().endsWith('.md') || fileName.toLowerCase().endsWith('.markdown');

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-screen px-8 py-6',
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    // Handle image paste
                    if (item.type.indexOf('image') !== -1) {
                        event.preventDefault();
                        const file = item.getAsFile();

                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const base64 = e.target?.result as string;
                                editor?.chain().focus().setImage({ src: base64 }).run();
                            };
                            reader.readAsDataURL(file);
                        }

                        return true;
                    }
                }

                return false;
            },
        },
    });

    // Auto-save when content changes
    useEffect(() => {
        if (debouncedContent !== lastSavedContent.current && debouncedContent) {
            onSave(debouncedContent);
            lastSavedContent.current = debouncedContent;
        }
    }, [debouncedContent, onSave]);

    // Update editor content when prop changes (e.g., switching files)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
            lastSavedContent.current = content;
        }
    }, [editor, content]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    if (!isMarkdown) {
        // For non-markdown files, use a simple textarea
        return (
            <div className="h-full">
                <textarea
                    value={content}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    className="w-full h-full p-8 font-mono text-sm bg-white dark:bg-gray-950 dark:text-gray-200 border-none focus:outline-none resize-none"
                    placeholder={placeholder}
                    readOnly={!editable}
                />
            </div>
        );
    }

    return (
        <div className="h-full bg-white dark:bg-gray-950 overflow-y-auto">
            <EditorContent editor={editor} />
        </div>
    );
}
