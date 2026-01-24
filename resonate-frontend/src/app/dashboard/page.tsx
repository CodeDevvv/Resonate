"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, BarChart3, Target, Settings, Lightbulb, PenSquare, ArrowRight, Copy } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useThougtofTheDay } from '@/userQueries/userQuery';

const quickLinks = [
  {
    title: 'New Entry',
    description: 'Create a new diary entry.',
    href: '/dashboard/diary?action=newEntry',
    icon: PenSquare,
  },
  {
    title: 'Browse Diary',
    description: 'Review your past entries.',
    href: '/dashboard/diary',
    icon: BookOpen,
  },
  {
    title: 'AI Insights',
    description: 'Discover patterns and trends.',
    href: '/dashboard/insights',
    icon: BarChart3,
  },
  {
    title: 'Manage Goals',
    description: 'Set and track your progress.',
    href: '/dashboard/goals',
    icon: Target,
  },
  {
    title: 'Settings',
    description: 'Adjust your preferences.',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function DashboardPage() {
  const { user } = useUser()
  const [isMounted, setIsMounted] = useState(false)

  // useQuery for Fetching Thoughts
  const { data: thoughtData, isLoading } = useThougtofTheDay()

  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) { return null }

  return (
    <div className="p-4 sm:p-6 md:p-8 ml-72 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="relative mb-8 group">
        <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full opacity-50" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground italic-none">
              {user ? (
                <>
                  <span className="text-muted-foreground font-medium">Welcome, </span>
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                    {user.firstName}!
                  </span>
                </>
              ) : (
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              )}
            </h1>
          </div>

          <div className="hidden md:block text-right">
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
            <div className="text-xs font-medium text-muted-foreground/40">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* Thought For the Day Block */}
      <div className="group relative transition-all duration-500 hover:-translate-y-1">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-card bg-gradient-to-br from-primary/90 to-accent/90 p-8 rounded-2xl shadow-xl text-primary-foreground overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                  <Lightbulb className="h-6 w-6 text-yellow-300" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Daily Inspiration</span>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Copy">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="h-6 bg-white/20 rounded-md w-full animate-pulse" />
                <div className="h-6 bg-white/20 rounded-md w-4/5 animate-pulse" />
                <div className="h-4 bg-white/10 rounded-md w-1/4 self-end animate-pulse mt-4" />
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold leading-snug tracking-tight decoration-accent/30 decoration-2 underline-offset-4 group-hover:underline">
                  “{thoughtData?.thought}”
                </h2>

                <div className="flex items-center justify-end gap-3">
                  <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-white/40" />
                  <cite className="not-italic text-sm font-bold tracking-wide uppercase text-white/90">
                    {thoughtData?.author}
                  </cite>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Quick Links</h2>
          <div className="h-px flex-grow mx-4 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                href={link.href}
                key={link.title}
                className="group relative block p-6 bg-card border border-border/50 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle Hover Gradient Mask */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex flex-col h-full space-y-4">
                  <div className="flex items-start justify-between">
                    {/* Icon Container with "Aura" */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative p-3 bg-secondary rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="p-2 rounded-full bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                      <ArrowRight className="h-4 w-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}