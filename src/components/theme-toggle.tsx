import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      className="btn-modern hover-float clickable glass-effect relative overflow-hidden"
    >
      <div className="relative z-10 transition-all duration-300">
        {isDark ? (
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        ) : (
          <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        )}
      </div>
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </Button>
  );
} 