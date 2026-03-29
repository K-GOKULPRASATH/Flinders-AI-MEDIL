"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, MessageCircle, LayoutDashboard } from "lucide-react";
import { AppLogo } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { logout } = useAuth();
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <AppLogo />
            <h1 className="text-xl font-bold tracking-tight">MediLexicon Assistant</h1>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant={pathname === "/chat" ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            </Link>
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary">A</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">admin</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Medical Practitioner
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

