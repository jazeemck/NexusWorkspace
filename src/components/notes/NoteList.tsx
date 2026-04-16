"use client";

import React, { useState } from "react";
import { Star, MoreVertical, Trash2, Copy, ExternalLink, Folder as FolderIcon, Hash, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

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

interface NoteListProps {
    notes: Note[];
    viewMode: "grid" | "list";
    folders: string[];
    onSelectNote: (id: string) => void;
    onDeleteNote: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    onDuplicate: (id: string) => void;
    onMoveNote: (id: string, folder: string) => void;
    emptyMessage: string;
}

export default function NoteList({ 
    notes, 
    viewMode, 
    folders,
    onSelectNote, 
    onDeleteNote,
    onToggleFavorite,
    onDuplicate,
    onMoveNote,
    emptyMessage
}: NoteListProps) {
    const [movingNoteId, setMovingNoteId] = useState<string | null>(null);

    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border rounded-[3rem] bg-card/10">
                <div className="w-20 h-20 rounded-[2.5rem] bg-foreground/5 border border-border flex items-center justify-center mb-8">
                    <FolderIcon className="w-10 h-10 text-foreground/10" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-[0.2em] text-foreground/20 mb-4">{emptyMessage}</h3>
                <p className="text-muted-foreground text-xs max-w-xs mx-auto leading-relaxed">Intelligence assets logged here will appear in your centralized knowledge network.</p>
            </div>
        );
    }

    const renderCard = (note: Note) => (
        <div 
            key={note.id} 
            onClick={() => onSelectNote(note.id)}
            className="bg-card border border-border rounded-[3rem] p-10 hover:border-foreground/30 transition-all cursor-pointer group relative flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-[0.98] shadow-sm animate-in fade-in zoom-in-95 duration-500"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                     <span className="bg-foreground/5 text-foreground/40 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-border/50 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-all duration-300">
                        {note.folder}
                    </span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
                    className={`transition-all hover:scale-110 ${note.favorite ? "text-foreground" : "text-muted-foreground/20 hover:text-foreground"}`}
                >
                    <Star className={`w-5 h-5 ${note.favorite ? "fill-current" : ""}`} />
                </button>
            </div>

            <h3 className="font-black text-2xl uppercase tracking-tighter mb-4 group-hover:text-foreground transition-colors leading-none truncate">
                {note.title}
            </h3>

            <p className="text-xs text-muted-foreground/40 leading-relaxed font-bold mb-10 line-clamp-3">
                {note.body?.slice(0, 100) || "No additional intelligence available for this asset."}
            </p>

            <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                {note.tags?.map(tag => (
                    <span key={tag} className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30 flex items-center gap-1 group-hover:text-foreground transition-colors">
                        <Hash className="w-2.5 h-2.5" /> {tag}
                    </span>
                ))}
            </div>

            <div className="pt-8 border-t border-border/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-muted-foreground/10 uppercase tracking-widest">Added: {formatDate(note.createdAt || note.updatedAt)}</span>
                    <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Edited: {formatDate(note.updatedAt)}</span>
                </div>
                <div className="relative group/menu py-2 px-2 -mr-2">
                    <MoreVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-foreground transition-all cursor-pointer" />
                    <div className="absolute right-0 bottom-[80%] w-48 bg-card border border-border rounded-[1.5rem] shadow-2xl z-50 p-2 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all translate-y-2 group-hover/menu:translate-y-0 scale-95 group-hover/menu:scale-100">
                        {/* Invisible bridge to prevent gap */}
                        <div className="absolute top-full left-0 right-0 h-8 -z-10" />
                        <button onClick={(e) => { e.stopPropagation(); onDuplicate(note.id); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all"><Copy className="w-4 h-4" /> Duplicate</button>
                        
                        {/* Move sub-menu */}
                        <div className="relative group/move-menu">
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all">
                                <span className="flex items-center gap-3"><ChevronRight className="w-4 h-4" /> Move To</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute left-full top-0 ml-1 w-48 bg-card border border-border rounded-xl shadow-2xl z-[60] p-1 opacity-0 group-hover/move-menu:opacity-100 pointer-events-none group-hover/move-menu:pointer-events-auto transition-all">
                                {folders.map(f => (
                                    <button 
                                        key={f}
                                        onClick={(e) => { e.stopPropagation(); onMoveNote(note.id, f); }}
                                        className="w-full text-left p-3 rounded-lg hover:bg-muted text-[9px] font-black uppercase tracking-widest"
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest transition-all"><Trash2 className="w-4 h-4" /> Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (viewMode === "list") {
        return (
            <div className="space-y-4">
                {notes.map((note) => (
                    <div 
                        key={note.id}
                        onClick={() => onSelectNote(note.id)}
                        className="group flex items-center gap-6 p-6 bg-card border border-border rounded-[2rem] hover:border-foreground/30 transition-all cursor-pointer hover:shadow-xl active:scale-[0.99]"
                    >
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-foreground/5 text-foreground/40 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-border/50 group-hover:bg-foreground group-hover:text-background transition-all">
                                    {note.folder}
                                </span>
                                <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                                    Created: {formatDate(note.createdAt || note.updatedAt)} {/* Edited: {formatDate(note.updatedAt)} */}
                                </span>
                            </div>
                            <h4 className="font-black text-lg truncate group-hover:text-foreground transition-colors uppercase tracking-tight">{note.title}</h4>
                        </div>
                        <div className="flex items-center gap-6 text-muted-foreground/30">
                            <div className="flex gap-2">
                                {note.tags?.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-foreground/20 group-hover:text-foreground transition-colors">#{tag}</span>
                                ))}
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
                                className={`transition-all hover:scale-110 ${note.favorite ? "text-foreground" : "hover:text-foreground"}`}
                            >
                                <Star className={`w-4 h-4 ${note.favorite ? "fill-current" : ""}`} />
                            </button>
                            <div className="relative group/menu">
                                <MoreVertical className="w-5 h-5 transition-all hover:text-foreground" />
                                <div className="absolute right-0 top-[80%] w-48 bg-card border border-border rounded-xl shadow-2xl z-50 p-1 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all translate-y-[-10px] group-hover/menu:translate-y-0">
                                    <div className="absolute bottom-full left-0 right-0 h-8 -z-10" />
                                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(note.id); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-[10px] font-black uppercase tracking-widest"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map(renderCard)}
        </div>
    );
}
