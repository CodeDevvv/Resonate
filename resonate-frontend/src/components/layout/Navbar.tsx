"use client"

import React from "react"
import { ModeToggle } from "./ModeToggle"
import { SignedOut } from "@clerk/nextjs"

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-background shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex-1" />
                    <div className="flex-1 flex justify-center">
                        <div className="flex items-center space-x-2">

                            {/* Text Gradient Title */}
                            <span
                                className="text-4xl font-black tracking-wider font-rampart"
                                style={{
                                    background: 'linear-gradient(90deg, #3a6ea5, #e07b39)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                Resonate
                            </span>
                        </div>

                    </div>
                    <div className="flex-1 flex justify-end">
                        <SignedOut>
                            <ModeToggle />
                        </SignedOut>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
