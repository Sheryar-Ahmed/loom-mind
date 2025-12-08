'use client';

import { Home, Search, FolderOpen, Settings, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Search',
    href: '/search',
    icon: Search,
  },
  {
    title: 'Collections',
    href: '/collections',
    icon: FolderOpen,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex h-full w-64 flex-col gap-4 border-r bg-background p-4">
      {/* Stats */}
      <div className="space-y-2">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Captures</span>
            <span className="text-2xl font-bold">{user?.captureCount || 0}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Quick Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground">
          <Tag className="h-3 w-3" />
          QUICK TAGS
        </div>
        <div className="space-y-1">
          <Link
            href="/search?tags=important"
            className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Important
          </Link>
          <Link
            href="/search?tags=todo"
            className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            To Do
          </Link>
          <Link
            href="/search?tags=reference"
            className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Reference
          </Link>
        </div>
      </div>
    </div>
  );
}
