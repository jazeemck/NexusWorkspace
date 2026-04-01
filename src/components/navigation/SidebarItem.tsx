import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    href: string;
    isActive?: boolean;
    onClick?: () => void;
}

export function SidebarItem({ icon: Icon, label, href, isActive, onClick }: SidebarItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 p-3 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group
                ${isActive
                    ? 'bg-foreground text-background border-foreground shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] scale-[1.02] border'
                    : 'bg-background text-muted-foreground border border-border hover:bg-foreground hover:text-background hover:-translate-y-1 hover:shadow-2xl hover:border-foreground'
                }
            `}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-500 ${isActive ? 'text-background' : 'text-muted-foreground group-hover:text-background group-hover:scale-110'}`} />
            <span className="truncate text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </Link>
    );
}
