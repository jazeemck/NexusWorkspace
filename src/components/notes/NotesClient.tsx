"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, Grid, List as ListIcon, Cloud, Star, FileText, Folder as FolderIcon, Tag as TagIcon, LayoutGrid } from "lucide-react";
import NoteList from "./NoteList";
import NoteNavigation from "./NoteNavigation";
import NoteEditor from "./NoteEditor";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import { useSession } from "next-auth/react";

export interface Note {
    id: string;
    title: string;
    body: string; // Plain text version for preview/search
    content: any; // Tiptap JSON
    tags: string[];
    folder: string;
    favorite: boolean;
    pinned: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CloudNotesData {
    notes: Note[];
    folders: string[];
    viewMode: "grid" | "list";
}

const GUEST_STORAGE_KEY = "guest_data";
const PREFS_STORAGE_KEY = "cloudnotes_prefs";

export default function NotesClient({ initialUser }: { initialUser: any }) {
    const { data: session } = useSession();
    const [data, setData] = useState<CloudNotesData>({
        notes: [],
        folders: ["General", "Work", "Personal", "Ideas"],
        viewMode: "grid"
    });
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'favorites' | 'folders' | 'tags'>('all');
    const [selectedDetail, setSelectedDetail] = useState<string | null>(null); // for specific folder or tag
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alpha' | 'edited'>('edited');
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Initial Load
    useEffect(() => {
        setIsMounted(true);
        const loadData = async () => {
            if (session?.user) {
                try {
                    const res = await fetch("/api/notes");
                    if (res.ok) {
                        const rawNotes = await res.json();
                        const normalizedNotes = rawNotes.map((n: any) => ({
                            ...n,
                            createdAt: n.createdAt || n.created_at || new Date().toISOString(),
                            updatedAt: n.updatedAt || n.updated_at || new Date().toISOString()
                        }));
                        setData(prev => ({ ...prev, notes: normalizedNotes }));
                    }
                } catch (e) {
                    console.error("Failed to fetch notes from API", e);
                }
            } else {
                const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
                if (savedGuest) {
                    try {
                        const parsed = JSON.parse(savedGuest);
                        if (parsed.notes) {
                            setData(prev => ({ ...prev, notes: parsed.notes }));
                        }
                    } catch (e) {
                        console.error("Failed to parse guest notes", e);
                    }
                }
            }
            
            // Load prefs (folders, viewMode) separately
            const savedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
            if (savedPrefs) {
                try {
                    const parsed = JSON.parse(savedPrefs);
                    setData(prev => ({ ...prev, ...parsed, notes: prev.notes }));
                } catch (e) {}
            }
            
            setLoading(false);
        };
        loadData();
    }, [session]);

    // Save Guest Data to LocalStorage
    useEffect(() => {
        if (!loading && !session) {
            const currentGuest = localStorage.getItem(GUEST_STORAGE_KEY);
            let guestObj: any = { notes: [], summaries: [], createdAt: new Date().toISOString() };
            if (currentGuest) {
                try { guestObj = JSON.parse(currentGuest); } catch (e) {}
            }
            guestObj.notes = data.notes;
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestObj));
        }
        
        // Save prefs regardless
        if (!loading) {
            localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({
                folders: data.folders,
                viewMode: data.viewMode
            }));
        }
    }, [data, loading, session]);

    const handleCreateNote = () => {
        setIsCreating(true);
        setSelectedNoteId(null);
    };

    const handleSaveNote = async (noteData: Partial<Note>, isManual: boolean = false) => {
        const now = new Date().toISOString();
        let currentId = selectedNoteId;

        if (isCreating) {
            const newNoteId = crypto.randomUUID();
            const newNote: Note = {
                id: newNoteId,
                title: noteData.title || "Untitled Note",
                body: noteData.body || "",
                content: noteData.content || { type: "doc", content: [] },
                tags: noteData.tags || [],
                folder: noteData.folder || "General",
                favorite: false,
                pinned: false,
                createdAt: now,
                updatedAt: now,
            };

            if (session?.user) {
                try {
                    const res = await fetch("/api/notes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newNote),
                    });
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.error || "Failed to save note");
                    }
                    const savedRaw = await res.json();
                    const saved = {
                        ...savedRaw,
                        createdAt: savedRaw.createdAt || savedRaw.created_at,
                        updatedAt: savedRaw.updatedAt || savedRaw.updated_at
                    };
                    setData(prev => ({ ...prev, notes: [saved, ...prev.notes] }));
                    
                    // CRITICAL: Use the ID from the database, not the client-generated one
                    setIsCreating(false);
                    setSelectedNoteId(saved.id);
                    if (isManual) toast.success("Note created!");
                } catch (e: any) {
                    const errMsg = e.message || "Failed to sync note to cloud.";
                    toast.error(errMsg);
                }
            } else {
                setData(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
                setIsCreating(false);
                setSelectedNoteId(newNoteId);
                if (isManual) toast.success("Note created!");
            }
        } else if (currentId) {
            const updatedNote = { ...noteData, updatedAt: now };
            
            if (session?.user) {
                try {
                    const res = await fetch(`/api/notes/${currentId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedNote),
                    });
                    if (!res.ok) throw new Error("Failed to update note");
                    const savedRaw = await res.json();
                    const saved = {
                        ...savedRaw,
                        createdAt: savedRaw.createdAt || savedRaw.created_at,
                        updatedAt: savedRaw.updatedAt || savedRaw.updated_at
                    };
                    setData(prev => ({
                        ...prev,
                        notes: prev.notes.map(n => n.id === currentId ? saved : n)
                    }));
                } catch (e) {
                    toast.error("Failed to sync changes.");
                }
            } else {
                setData(prev => ({
                    ...prev,
                    notes: prev.notes.map(n => n.id === currentId ? { ...n, ...updatedNote } : n)
                }));
            }
            
            if (isManual) {
                toast.success("Note updated!");
                setSelectedNoteId(null);
            }
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (session?.user) {
            try {
                const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to delete note");
                setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
                toast.success("Note deleted from cloud.");
            } catch (e) {
                toast.error("Failed to delete note.");
            }
        } else {
            setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
            toast.success("Note deleted.");
        }
    };

    const handleToggleFavorite = (id: string) => {
        setData(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n)
        }));
    };

    const handleDuplicateNote = (id: string) => {
        const target = data.notes.find(n => n.id === id);
        if (!target) return;
        const newNote: Note = {
            ...target,
            id: crypto.randomUUID(),
            title: `${target.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setData(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
        toast.success("Note duplicated!");
    };

    // Filtering and Sorting
    const filteredNotes = useMemo(() => {
        let result = [...data.notes];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(n => 
                n.title.toLowerCase().includes(q) || 
                n.body.toLowerCase().includes(q) || 
                n.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        // Sidebar/Tab Filter
        if (filterType === 'favorites') {
            result = result.filter(n => n.favorite);
        } else if (filterType === 'folders' && selectedDetail) {
            result = result.filter(n => n.folder === selectedDetail);
        } else if (filterType === 'tags' && selectedDetail) {
            result = result.filter(n => n.tags.includes(selectedDetail));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === 'alpha') return a.title.localeCompare(b.title);
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        return result;
    }, [data.notes, searchQuery, filterType, selectedDetail, sortBy]);

    const activeNote = data.notes.find(n => n.id === selectedNoteId);

    if (!isMounted) return null;

    if (isCreating || activeNote) {
        return (
            <NoteEditor 
                note={activeNote}
                folders={data.folders}
                onSave={handleSaveNote}
                onCancel={() => { setIsCreating(false); setSelectedNoteId(null); }}
            />
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background flex-col relative">
            <main className="flex-1 flex flex-col min-w-0 pb-24">
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Cloud className="w-4 h-4 text-muted-foreground/40" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Local Knowledge Base</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                {filterType === 'favorites' ? 'Favorites' : 
                                 filterType === 'folders' ? `Folder: ${selectedDetail}` :
                                 filterType === 'tags' ? `Tag: #${selectedDetail}` : 'Cloud Notes'}
                            </h1>
                        </div>
                        <button 
                            suppressHydrationWarning
                            onClick={handleCreateNote}
                            className="bg-foreground text-background px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
                        >
                            <Plus className="w-4 h-4" /> New Note
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search title, body, or tags..." 
                                className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:border-foreground outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center bg-card border border-border rounded-xl p-1">
                            <button 
                                onClick={() => setData(prev => ({ ...prev, viewMode: 'grid' }))}
                                className={`p-2 rounded-lg transition-all ${data.viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setData(prev => ({ ...prev, viewMode: 'list' }))}
                                className={`p-2 rounded-lg transition-all ${data.viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setShowFilterPanel(!showFilterPanel)}
                                className={`bg-card border border-border p-3 rounded-xl transition-all ${showFilterPanel ? 'border-foreground shadow-lg' : ''}`}
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                            {showFilterPanel && (
                                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 p-6 space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Sort By</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['newest', 'oldest', 'alpha', 'edited'].map((s) => (
                                                <button 
                                                    key={s}
                                                    onClick={() => setSortBy(s as any)}
                                                    className={`text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${sortBy === s ? 'bg-foreground text-background' : 'hover:bg-muted text-muted-foreground'}`}
                                                >
                                                    {s === 'alpha' ? 'A-Z' : s.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Jump to Folder</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {data.folders.map(f => (
                                                <button 
                                                    key={f}
                                                    onClick={() => { setFilterType('folders'); setSelectedDetail(f); setShowFilterPanel(false); }}
                                                    className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'folders' && selectedDetail === f ? 'bg-black text-white border-black' : 'border-border hover:border-foreground'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Filter by Tag</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(data.notes.flatMap(n => n.tags))).map(t => (
                                                <button 
                                                    key={t}
                                                    onClick={() => { setFilterType('tags'); setSelectedDetail(t); setShowFilterPanel(false); }}
                                                    className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'tags' && selectedDetail === t ? 'bg-black text-white border-black' : 'border-border hover:border-foreground'}`}
                                                >
                                                    #{t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-0">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-card border border-border rounded-[2.5rem] p-8 animate-pulse h-48"></div>
                            ))}
                        </div>
                    ) : (
                        <NoteList 
                            notes={filteredNotes} 
                            viewMode={data.viewMode}
                            folders={data.folders}
                            onSelectNote={setSelectedNoteId}
                            onDeleteNote={handleDeleteNote}
                            onToggleFavorite={handleToggleFavorite}
                            onDuplicate={handleDuplicateNote}
                            onMoveNote={(id, folder) => setData(prev => ({
                                ...prev,
                                notes: prev.notes.map(n => n.id === id ? { ...n, folder } : n)
                            }))}
                            emptyMessage={
                                filterType === 'favorites' ? "No starred notes found." :
                                filterType === 'folders' ? "This folder is empty." :
                                filterType === 'tags' ? "No notes with this tag." : "No notes yet. Click '+ NEW NOTE' to start."
                            }
                        />
                    )}
                </div>
            </main>

            <NoteNavigation 
                filterType={filterType}
                onSelectFilter={(type: 'all' | 'favorites' | 'folders' | 'tags', id?: string) => {
                    setFilterType(type);
                    setSelectedDetail(id || null);
                    setSelectedNoteId(null);
                }}
                onNewNote={handleCreateNote}
                data={data}
            />
        </div>
    );
}

