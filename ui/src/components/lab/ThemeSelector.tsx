import React from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeType } from "@/types/theme";

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const themes: { value: ThemeType; label: string; color: string }[] = [
  { value: "default", label: "Default", color: "bg-gray-300" },
  { value: "cyberpunk", label: "Cyberpunk", color: "bg-fuchsia-500" },
  { value: "matrix", label: "Matrix", color: "bg-green-500" },
  { value: "midnight", label: "Midnight", color: "bg-blue-500" },
  { value: "light", label: "Light", color: "bg-amber-500" },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const currentThemeColor =
    themes.find((theme) => theme.value === currentTheme)?.color ||
    themes[0].color;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 relative">
          <Palette className="h-4 w-4" />
          <span
            className={`absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full ${currentThemeColor}`}
          ></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className="flex items-center justify-between gap-2 p-2"
          >
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${theme.color}`}></span>
              {theme.label}
            </div>
            {currentTheme === theme.value && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
