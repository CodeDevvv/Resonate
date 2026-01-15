"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, BarChart3, Target, Settings, Lightbulb, PenSquare, ArrowRight } from 'lucide-react';
import { useThougtofTheDay } from '@/userQueries/userQuery';
import { useUser } from '@clerk/nextjs';

const ThoughtOfTheDayCard = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: thoughtData, isLoading } = useThougtofTheDay()

  if (!isMounted) { return null }

  return (
    <div className="bg-gradient-to-r from-primary/90 to-accent/80 p-6 rounded-2xl shadow-lg text-primary-foreground">
      <div className="flex items-start gap-4">
        <Lightbulb className="h-8 w-8 mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <h2 className="text-xl font-bold mb-2">Thought of the Day</h2>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-primary/30 rounded w-3/4"></div>
              <div className="h-4 bg-primary/30 rounded w-1/2"></div>
              <div className="h-3 bg-primary/30 rounded w-1/4 mt-2"></div>
            </div>
          ) : (
            <blockquote className="border-l-4 border-accent/70 pl-4">
              <p className="text-lg italic">&quot;{thoughtData?.thought}&quot;</p>
              <cite className="block text-right mt-2 not-italic font-semibold">— {thoughtData?.author}</cite>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const quickLinks = [
    {
      title: 'New Entry',
      description: 'Create a new diary entry.',
      href: '/dashboard/diary',
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
  const { user } = useUser()
  return (
    <div className="p-4 sm:p-6 md:p-8 ml-72 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">{user ? `Welcome ${user.firstName}!` : "Welcome Back"}</h1>

      <ThoughtOfTheDayCard />

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                href={link.href}
                key={link.title}
                className="group block p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Icon className="h-8 w-8 text-primary" />
                    <h3 className="text-lg font-bold text-card-foreground">{link.title}</h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="mt-2 text-muted-foreground">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}