import { Moon, Sun } from "lucide-react";
import { useTheme } from "./themeProvider";
import { Button } from "./ui/button";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <>
      <Button onClick={() => setTheme("light")}>
        <Sun />
      </Button>
      <Button onClick={() => setTheme("dark")}>
        <Moon />
      </Button>
    </>
  );
}
