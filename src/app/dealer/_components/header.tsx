

"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Copy } from 'lucide-react';
import { currentDealer } from '@/lib/data';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useClientState } from '@/hooks/use-client-state';
import type { User } from '@/lib/types';


function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0 || segments[0] !== 'dealer') return null;

    return (
        <nav aria-label="breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
                <li>
                    <Link href="/dealer/dashboard" className="text-muted-foreground hover:text-foreground">
                        Dashboard
                    </Link>
                </li>
                {segments.slice(1).map((segment, index) => {
                    const href = '/' + segments.slice(0, index + 2).join('/');
                    const isLast = index === segments.length - 2;
                    return (
                        <li key={href} className="flex items-center space-x-2">
                            <span className="text-muted-foreground">/</span>
                            {isLast ? (
                                <span className="font-medium text-foreground capitalize">
                                    {segment.replace(/-/g, ' ')}
                                </span>
                            ) : (
                                <Link href={href} className="text-muted-foreground hover:text-foreground capitalize">
                                    {segment.replace(/-/g, ' ')}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}


export function DealerHeader() {
  const user = useClientState<User | undefined>(currentDealer);
  const { toast } = useToast();

  if (!user) return <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"></header>; // Render empty header to avoid layout shift

  const handleCopyCode = () => {
    if(user.uniqueDealerCode) {
        navigator.clipboard.writeText(user.uniqueDealerCode);
        toast({ title: "Copied!", description: "Your unique dealer code has been copied to the clipboard." });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="hidden md:block">
        {user.role === 'admin' ? <Breadcrumbs /> : ( user.uniqueDealerCode &&
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Your Code: <span className="font-mono text-base text-foreground font-semibold">{user.uniqueDealerCode}</span></span>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyCode}>
                    <Copy className="size-3.5" />
                </Button>
            </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="w-full rounded-full bg-background/50 pl-8 md:w-[200px] lg:w-[320px]" />
        </div>
        <LanguageToggle />
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="size-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/dealer/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/dealer/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/login">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
