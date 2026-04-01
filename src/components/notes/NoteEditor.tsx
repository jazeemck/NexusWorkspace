"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { 
    ChevronLeft, Save, Sparkles, Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, Code, Heading1, Heading2, Heading3, Loader2,
    Type, LayoutList, AlignLeft, Download, Highlighter, CaseSensitive,
    ChevronDown, FileText, FileCode, Tag, Folder, Hash, X
} from 'lucide-react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { formatDate } from '@/lib/utils';
import CharacterCount from '@tiptap/extension-character-count';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Note {
    id: string;
    title: string;
    body: string;
    content: any;
    tags: string[];
    folder: string;
    favorite: boolean;
    pinned: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NoteEditorProps {
    note?: Note;
    folders: string[];
    onSave: (updates: Partial<Note>, isManual?: boolean) => void;
    onCancel: () => void;
}

export default function NoteEditor({ note, folders, onSave, onCancel }: NoteEditorProps) {
    const [title, setTitle] = useState(note?.title || "");
    const [tagsInput, setTagsInput] = useState(note?.tags?.join(", ") || "");
    const [folder, setFolder] = useState(note?.folder || folders[0] || "General");
    const [isSaving, setIsSaving] = useState(false);
    
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const [showAiMenu, setShowAiMenu] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const downloadRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const aiRef = useRef<HTMLDivElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Start writing your brilliance...' }),
            Link.configure({ openOnClick: false }),
            Underline,
            Highlight.configure({ multicolor: true }),
            TextStyle,
            FontFamily,
            CharacterCount,
        ],
        content: note?.content || { type: "doc", content: [] },
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[500px] pb-32 font-clean text-black',
            },
        },
    });

    const lastSavedState = useRef({ title, folder, tagsInput, content: editor?.getJSON() });

    // Click outside logic
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) setShowDownloadMenu(false);
            if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) setShowHighlightMenu(false);
            if (aiRef.current && !aiRef.current.contains(e.target as Node)) setShowAiMenu(false);
        }
        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

    // Auto-save logic
    useEffect(() => {
        if (!editor) return;
        const timer = setInterval(() => {
            const currentContent = editor.getJSON();
            const hasChanged = title !== lastSavedState.current.title || 
                               folder !== lastSavedState.current.folder || 
                               tagsInput !== lastSavedState.current.tagsInput ||
                               JSON.stringify(currentContent) !== JSON.stringify(lastSavedState.current.content);
            if (hasChanged) {
                onSave({
                    title: title || "Untitled Note",
                    content: currentContent,
                    body: editor.getText(),
                    tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
                    folder
                }, false);
                lastSavedState.current = { title, folder, tagsInput, content: currentContent };
            }
        }, 3000);
        return () => clearInterval(timer);
    }, [editor, title, folder, tagsInput, onSave]);

    const handleManualSave = () => {
        if (!editor) return;
        setIsSaving(true);
        onSave({
            title: title || "Untitled Note",
            content: editor.getJSON(),
            body: editor.getText(),
            tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
            folder
        }, true);
        toast.success("Intelligence secured.");
        onCancel();
    };

    const handleDownloadPdf = async () => {
        if (!editorContainerRef.current) return;
        setShowDownloadMenu(false);
        const loadingToast = toast.loading("Synthesizing PDF Asset...");
        try {
            const element = editorContainerRef.current;
            
            // 1. Manually clone the element
            const clone = element.cloneNode(true) as HTMLElement;
            clone.id = 'pdf-clone-doc';
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = `${element.offsetWidth}px`;
            clone.style.height = 'auto';
            document.body.appendChild(clone);

            // 2. Walk elements and overwrite any lab()/oklch() styles
            const allElements = [clone, ...Array.from(clone.querySelectorAll('*'))];
            allElements.forEach(child => {
                const el = child as HTMLElement;
                const style = window.getComputedStyle(el);
                ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                    const val = style[prop as any];
                    if (val && (val.includes('lab') || val.includes('lch') || val.includes('oklch') || val.includes('oklab'))) {
                        el.style[prop as any] = prop === 'backgroundColor' ? '#ffffff' : '#1a1a1a';
                    }
                });
            });

            // 3. Inject global style overrides to ensure safety
            const styleTag = document.createElement('style');
            styleTag.innerHTML = `
                #pdf-clone-doc * {
                    color: inherit !important;
                }
                #pdf-clone-doc [style*="lab("],
                #pdf-clone-doc [style*="lch("],
                #pdf-clone-doc [style*="oklch("],
                #pdf-clone-doc [style*="oklab("] {
                    color: #000000 !important;
                    background-color: #ffffff !important;
                }
            `;
            clone.appendChild(styleTag);

            // 4. Run html2canvas on the safe clone
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            // 5. Cleanup the DOM
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pageHeight - 20);
            }

            pdf.save(`${title.replace(/\s+/g, '_') || 'Asset'}.pdf`);
            toast.success("Intelligence PDF Secured", { id: loadingToast });
        } catch (err) {
            console.error("PDF Export Error:", err);
            toast.error("Shields up: PDF synthesis failed.", { id: loadingToast });
        }
    };

    const handleDownloadTxt = () => {
        if (!editor) return;
        setShowDownloadMenu(false);
        const text = `${title}\n\n${editor.getText()}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_') || 'Note'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("TXT Downloaded");
    };

    const handleAiAction = async (action: string) => {
        if (!editor) return;
        setIsAiProcessing(true);
        setShowAiMenu(false);
        try {
            const response = await fetch('/api/notes/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, content: editor.getText(), title }),
            });
            const data = await response.json();
            if (data.result) {
                if (action === 'suggest_title') setTitle(data.result);
                else if (action === 'refine') {
                    editor.commands.setContent(data.result);
                } else {
                    editor.chain().focus().insertContentAt(0, `<div style="background:#f3f4f6;padding:1rem;border-radius:0.75rem;margin-bottom:1rem;font-style:italic;">${data.result}</div>`).run();
                }
                toast.success("AI operation completed.");
            }
        } catch (err) {
            toast.error("AI node communication error.");
        } finally {
            setIsAiProcessing(false);
        }
    };

    if (!editor) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden selection:bg-black selection:text-white text-black">
            {/* Toolbar */}
            <div className="border-b border-gray-100 px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-xl z-30 sticky top-0">
                <div className="flex items-center gap-1">
                    <button onClick={onCancel} className="p-2 hover:bg-gray-50 rounded-xl transition-all group mr-2">
                        <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-black" />
                    </button>
                    
                    <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} />
                        
                        <div className="w-px h-5 bg-gray-200 mx-1" />

                        {/* Highlighter Dropdown */}
                        <div className="relative" ref={highlightRef}>
                            <ToolbarButton onClick={() => setShowHighlightMenu(!showHighlightMenu)} active={editor.isActive('highlight')} icon={Highlighter} />
                            {showHighlightMenu && (
                                <div className="absolute left-0 mt-3 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-3 grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-1">
                                    {['#fef08a', '#bfdbfe', '#fecaca', '#bbf7d0'].map(color => (
                                        <button 
                                            key={color} 
                                            onClick={() => { editor.chain().focus().toggleHighlight({ color }).run(); setShowHighlightMenu(false); }}
                                            className="w-6 h-6 rounded-full hover:scale-125 transition-transform border border-black/5" 
                                            style={{ backgroundColor: color }} 
                                        />
                                    ))}
                                    <button onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightMenu(false); }} className="col-span-4 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-black pt-2 border-t border-gray-50 mt-2">Clear</button>
                                </div>
                            )}
                        </div>

                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} icon={Code} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* AI Tools */}
                    <div className="relative" ref={aiRef}>
                        <button 
                            onClick={() => setShowAiMenu(!showAiMenu)}
                            disabled={isAiProcessing}
                            className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-black border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            {isAiProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            System AI
                        </button>
                        {showAiMenu && (
                            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden p-2 animate-in fade-in slide-in-from-top-1">
                                <AiBtn onClick={() => handleAiAction('suggest_title')} icon={Type} label="Optimize Title" />
                                <AiBtn onClick={() => handleAiAction('summarize')} icon={AlignLeft} label="Intelligence Brief" />
                                <AiBtn onClick={() => handleAiAction('refine')} icon={Sparkles} label="Refine Asset" />
                            </div>
                        )}
                    </div>

                    {/* Download */}
                    <div className="relative" ref={downloadRef}>
                        <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} className="p-2.5 hover:bg-gray-50 rounded-xl transition-all border border-gray-100">
                            <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        {showDownloadMenu && (
                            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-1">
                                <DropdownItem onClick={handleDownloadPdf} icon={FileCode} label="Export as PDF" />
                                <DropdownItem onClick={handleDownloadTxt} icon={FileText} label="Export as TXT" />
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleManualSave}
                        className="flex items-center gap-3 px-8 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-black/10"
                    >
                         <Save className="w-4 h-4" /> Save Asset
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto cursor-text">
                <div className="max-w-[700px] mx-auto px-6 py-20 min-h-full" ref={editorContainerRef} id="pdf-content">
                    <div className="mb-16 space-y-8">
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Asset Title..."
                            className="w-full text-6xl font-black tracking-tight bg-transparent outline-none placeholder:text-gray-100 border-none p-0 focus:ring-0 text-black"
                        />

                        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                            {/* Folder */}
                            <div className="flex items-center gap-3 bg-gray-50/50 px-5 py-2.5 rounded-2xl border border-gray-100">
                                <Folder className="w-4 h-4 text-gray-300" />
                                <select 
                                    value={folder}
                                    onChange={(e) => setFolder(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                                >
                                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            {/* Tags */}
                            <div className="flex-1 flex items-center gap-3 bg-gray-50/50 px-5 py-2.5 rounded-2xl border border-gray-100">
                                <Hash className="w-4 h-4 text-gray-300" />
                                <input 
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="Directives (tag1, tag2)..."
                                    className="bg-transparent flex-1 text-[10px] font-black uppercase tracking-widest outline-none placeholder:text-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ onClick, active, icon: Icon }: any) {
    return (
        <button 
            onClick={onClick}
            className={`p-2 rounded-xl transition-all ${active ? "bg-black text-white" : "text-gray-400 hover:bg-gray-100 hover:text-black"}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}

function DropdownItem({ onClick, icon: Icon, label }: any) {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-all">
            <Icon className="w-4 h-4" /> {label}
        </button>
    );
}

function AiBtn({ onClick, icon: Icon, label }: any) {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-black hover:text-white transition-all text-left group">
            <Icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
