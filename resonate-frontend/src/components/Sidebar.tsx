"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Target,
  Settings as SettingsIcon,
  Menu
} from "lucide-react";

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Diary', href: '/dashboard/diary', icon: <BookOpen className="w-5 h-5" /> },
  { name: 'Insights', href: '/dashboard/insights', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Goals', href: '/dashboard/goals', icon: <Target className="w-5 h-5" /> },
  { name: 'Settings', href: '/dashboard/settings', icon: <SettingsIcon className="w-5 h-5" /> },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-lg md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside
        className={`
          fixed top-3 ml-2 left-3 h-[calc(100vh-1.25rem)] w-64 
          bg-sidebar/80 border-r border-sidebar-border rounded-2xl shadow-xl
          backdrop-blur-md transition-transform duration-300 ease-in-out z-40
          flex flex-col items-stretch
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex items-center gap-2 px-6 py-6 pb-2">
          <span className="text-4xl font-extrabold tracking-tight font-rampart bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
            Resonate
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 mt-6 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200
                  cursor-pointer select-none relative
                  ${isActive
                    ? 'bg-gradient-to-r from-primary/90 to-accent/80 text-primary-foreground shadow-md'
                    : 'text-sidebar-foreground hover:bg-primary/10 hover:text-primary'}
                `}
                style={{
                  boxShadow: isActive ? '0 2px 12px 0 rgba(80,80,255,0.08)' : undefined
                }}
              >
                <span className={`
                  absolute left-0 top-2 bottom-2 w-1 rounded-full
                  ${isActive ? 'bg-accent transition-all' : ''}
                `} />
                <span className="z-10">{item.icon}</span>
                <span className="z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex-1" />
        <div className="px-6 py-4 text-xs text-muted-foreground opacity-60">
          © {new Date().getFullYear()} Resonate
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}
