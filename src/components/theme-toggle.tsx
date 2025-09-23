import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const root = document.documentElement;
    if (saved === "dark") {
      root.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      setIsDark(root.classList.contains("dark"));
    }
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    const nowDark = root.classList.contains("dark");
    setIsDark(nowDark);
    localStorage.setItem("theme", nowDark ? "dark" : "light");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative overflow-hidden group"
          >
            <div className="relative z-10 transition-all duration-300">
              <Sun className="h-4 w-4 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-600 dark:text-yellow-400 drop-shadow-sm" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-600 dark:text-slate-200 drop-shadow-sm" />
            </div>
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* 主题切换指示器 */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-300/10 to-yellow-300/10 opacity-0 dark:opacity-0 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/10 to-blue-600/10 opacity-0 dark:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 