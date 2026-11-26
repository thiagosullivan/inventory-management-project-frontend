import { Moon, Sun } from "lucide-react";
import { useTheme } from "./themeProvider";
import { Button } from "./ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      className="w-8 h-8 lg:w-12 lg:h-12 bg-transparent hover:bg-blue-solid! lg:bg-muted-foreground/30 text-foreground cursor-pointer"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="h-6! w-6! lg:h-5 lg:w-5" />
      ) : (
        <Sun className="h-6! w-6! lg:h-5 lg:w-5" />
      )}
    </Button>
  );
}
