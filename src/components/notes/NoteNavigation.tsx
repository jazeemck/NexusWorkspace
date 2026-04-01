"use client";

import React, { useState } from "react";
import { 
    Folder as FolderIcon, 
    FileText, 
    Pin, 
    Star,
    Tag,
    Plus,
    X,
    FolderPlus,
    Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, MenuItem, HoveredLink, ProductItem } from "@/components/ui/navbar-menu";
import { cn, formatDate } from "@/lib/utils";

interface NoteNavigationProps {
    filterType: 'all' | 'favorites' | 'folders' | 'tags';
    onSelectFilter: (type: 'all' | 'favorites' | 'folders' | 'tags', id?: string) => void;
    onNewNote: () => void;
    data: {
        notes: any[];
        folders: string[];
    };
}

export default function NoteNavigation({
    filterType,
    onSelectFilter,
    onNewNote,
    data
}: NoteNavigationProps) {
    const [active, setActive] = useState<string | null>(null);

    // Grouping for the menus
    const favorites = (data.notes || []).filter((n: any) => n.favorite);
    const tags = Array.from(new Set((data.notes || []).flatMap((n: any) => n.tags || []))) as string[];

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <div className={cn(
                "group/nav transition-all duration-300 ease-in-out px-6 py-3 rounded-[3rem]",
                "bg-black/90 backdrop-blur-3xl border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,1)]"
            )}>
                <Menu setActive={setActive} className="!bg-transparent border-none shadow-none space-x-12 px-2 py-0 h-16 items-center flex">
                    
                    {/* All Notes */}
                    <NavIconItem 
                        onClick={() => onSelectFilter('all')}
                        isActive={filterType === 'all'}
                        icon={FileText}
                        label="Notes"
                    />

                    {/* Favorites */}
                    <MenuItem 
                        setActive={setActive} 
                        active={active} 
                        item="Favorites" 
                        placement="top" 
                        trigger={
                            <NavIconTrigger 
                                isActive={filterType === 'favorites'}
                                icon={Star}
                                onClick={() => onSelectFilter('favorites')}
                            />
                        }
                    >
                        <div className="flex flex-col space-y-4 min-w-[260px] p-4 bg-black/50 rounded-3xl">
                             <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 animate-pulse">Starred Assets</span>
                                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-white/40">{favorites.length}</span>
                             </div>
                            {favorites.length === 0 ? (
                                <p className="text-[10px] font-black italic text-white/20 text-center py-8">Zero prioritized items found</p>
                            ) : (
                                favorites.slice(0, 4).map(note => (
                                    <button 
                                        key={note.id} 
                                        onClick={() => onSelectFilter('all')}
                                        className="w-full text-left group/note hover:bg-white/5 p-3 rounded-2xl transition-all border border-transparent hover:border-white/5"
                                    >
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover/note:text-white transition-colors">{note.title}</div>
                                        <div className="text-[8px] text-white/20 group-hover/note:text-white/40 truncate mt-1">{note.folder} • {formatDate(note.updatedAt)}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </MenuItem>

                    {/* Create New Note - Center Pin */}
                    <div className="relative group/pin">
                        <motion.button 
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onNewNote}
                            className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] transition-all z-20 overflow-hidden"
                        >
                            <Plus className="w-8 h-8 transition-transform duration-500" />
                        </motion.button>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/pin:opacity-100 transition-all text-[10px] font-black uppercase tracking-[0.4em] text-white whitespace-nowrap bg-black px-4 py-2 rounded-full border border-white/20">
                            Initialize Directives
                        </div>
                    </div>

                    {/* Folders */}
                    <MenuItem 
                        setActive={setActive} 
                        active={active} 
                        item="Folders" 
                        placement="top" 
                        trigger={
                            <NavIconTrigger 
                                isActive={filterType === 'folders'}
                                icon={FolderIcon}
                                onClick={() => onSelectFilter('folders', data.folders[0])} 
                            />
                        }
                    >
                        <div className="flex flex-col space-y-3 min-w-[220px] p-4 bg-black/50 rounded-[2rem]">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Intelligence Clusters</span>
                            </div>
                            {(data.folders as string[]).map((folder: string, idx: number) => (
                                <button 
                                     key={`folder-${folder}-${idx}`} 
                                     onClick={() => onSelectFilter('folders', folder)}
                                     className={cn(
                                         "flex items-center justify-between w-full p-3 rounded-2xl transition-all border group/fold hover:bg-white/5",
                                         filterType === 'folders' && active === folder ? "border-white/20 bg-white/10" : "border-transparent"
                                     )}
                                 >
                                     <div className="flex items-center gap-4">
                                         <FolderIcon className="w-4 h-4 text-white/30 group-hover/fold:text-white transition-colors" />
                                         <span className={cn(
                                             "text-[10px] font-black tracking-widest uppercase",
                                             filterType === 'folders' && active === folder ? "text-white" : "text-white/40 group-hover/fold:text-white"
                                         )}>{folder}</span>
                                     </div>
                                     <span className="text-[8px] text-white/20 font-black tracking-tighter">00{(data.notes as any[]).filter((n: any) => n.folder === folder).length}</span>
                                </button>
                            ))}
                        </div>
                    </MenuItem>

                    {/* Tags */}
                    <MenuItem 
                        setActive={setActive} 
                        active={active} 
                        item="Tags" 
                        placement="top" 
                        trigger={
                            <NavIconTrigger 
                                isActive={filterType === 'tags'}
                                icon={Tag}
                                onClick={() => onSelectFilter('tags', tags[0])} 
                            />
                        }
                    >
                        <div className="flex flex-col space-y-4 min-w-[280px] p-6 bg-black/60 rounded-[2.5rem] border border-white/10 shadow-3xl">
                             <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Active Directives</span>
                            </div>
                            {tags.length === 0 ? (
                                <p className="text-[10px] font-medium text-white/10 text-center py-10 italic">Local directive network offline</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {(tags as any[]).map((tag: any, idx: number) => (
                                        <button 
                                            key={`tag-${tag}-${idx}`}
                                            onClick={() => onSelectFilter('tags', tag)}
                                            className="text-left group/tag hover:bg-white/5 p-3 rounded-2xl transition-all border border-transparent hover:border-white/10"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover/tag:bg-white group-hover/tag:scale-150 transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover/tag:text-white transition-colors truncate">{tag}</span>
                                                </div>
                                                <span className="text-[7px] text-white/10 font-bold">{(data.notes as any[]).filter(n => n.tags?.includes(tag)).length}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </MenuItem>
                </Menu>
            </div>
        </div>
    );
}

function NavIconItem({ onClick, isActive, icon: Icon, label }: { onClick: () => void, isActive: boolean, icon: React.ElementType, label: string }) {
    return (
        <div onClick={onClick} className="relative cursor-pointer group flex items-center justify-center w-12 h-12 transition-all duration-300">
            {isActive && (
                <motion.div layoutId="active-nav-pill" className="absolute inset-0 rounded-2xl bg-white/10 border border-white/20 z-0" />
            )}
            <Icon className={cn(
                "w-5 h-5 transition-all duration-500 relative z-10",
                isActive ? "text-white scale-110" : "text-white/30 group-hover:text-white"
            )} />
            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">{label}</div>
        </div>
    );
}

function NavIconTrigger({ isActive, icon: Icon, onClick }: { isActive: boolean, icon: React.ElementType, onClick: () => void }) {
    return (
        <div onClick={onClick} className="relative cursor-pointer group flex items-center justify-center w-12 h-12 transition-all duration-300">
            {isActive && (
                <motion.div layoutId="active-nav-pill" className="absolute inset-0 rounded-2xl bg-white/10 border border-white/20 z-0" />
            )}
            <Icon className={cn(
                "w-5 h-5 transition-all duration-500 relative z-10",
                isActive ? "text-white scale-110" : "text-white/30 group-hover:text-white"
            )} />
        </div>
    );
}
