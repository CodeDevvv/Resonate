"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

const ThemeSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <SwitchPrimitives.Root
      ref={ref}
      checked={isDark}
      onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
      className={cn(
        "peer inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      aria-label="Toggle dark mode"
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none flex items-center justify-center h-7 w-7 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-5 w-5 text-blue-500" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-500" />
        )}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
})
ThemeSwitch.displayName = "ThemeSwitch"

export function ModeToggle() {
  return <ThemeSwitch />
}
