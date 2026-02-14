"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import {
  Mail,
  Github,
  Linkedin,
  Instagram,
  FileText,
  Heart,
  UserCog,
  Palette,
  Download,
  ChevronRight,
  Shield,
  Globe,
  FileBarChart,
} from "lucide-react";
import { ModeToggle } from "@/components/layout/ModeToggle";
import FAQ from "@/components/shared/FAQ";

const Settings = () => {
  const { openUserProfile } = useClerk();

  return (
    <div className="mt-10 ml-80 max-w-6xl ">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 mb-10 border border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-primary font-rampart tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Customize your Resonate experience and manage your account
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <UserCog className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Account Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your personal details
                </p>
              </div>
              <SignOutButton />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full font-medium flex gap-2"
                onClick={() => openUserProfile()}
              >
                <Shield className="w-4 h-4" />
                Manage Account
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Palette className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Theme Preference</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your interface
                </p>
              </div>
              <ModeToggle />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium">Language</h3>
                <p className="text-sm text-muted-foreground">
                  English (Default)
                </p>
              </div>
              <ChevronRight className="text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-secondary/10 p-2 rounded-lg">
              <Globe className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-xl font-bold">About & Contact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">About Resonate</h3>
              <p className="text-muted-foreground text-sm">
                Your private AI-powered voice diary. Built with a focus on privacy,
                insight, and personal growth. We believe in ethical AI that serves you.
              </p>
              <div className="flex items-center mt-4 text-muted-foreground text-sm">

                Made with  <Heart className="w-4 h-4 text-red-500 mr-1 ml-1" />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Connect With Me</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="flex gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
                <Button variant="outline" className="flex gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" className="flex gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Export Card */}
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Export Your Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your entries as a PDF with transcripts, summaries, and tags
              </p>
              <Button className="w-full flex gap-2 font-medium">
                <FileText className="w-4 h-4" />
                Export All Entries
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Data Insights</h3>
              <p className="text-sm text-muted-foreground">
                View analytics about your journaling habits
              </p>
              <Button variant="outline" className="w-full mt-3 flex gap-2">
                <FileBarChart className="w-4 h-4" />
                View Insights
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default Settings;
