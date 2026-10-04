import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SlidersHorizontal } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";

interface FilterShellProps {
  children: React.ReactNode;
}

export function FilterShell({ children }: FilterShellProps) {
  const { clearFilters } = useProductQueryParams();
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const triggerElement = (
    <Button variant="outline" className="gap-2">
      <SlidersHorizontal className="h-4 w-4" />
      Filtros
    </Button>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={triggerElement} />
        <SheetContent side="right" className="w-[400px]" disableBlur>
          <SheetHeader>
            <SheetTitle>Filtros sheet</SheetTitle>
            <SheetDescription>Refine a sua busca abaixo.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col">
            <div className="p-4 h-[calc(100vh-220px)] overflow-y-auto">
              {children}
            </div>
            <div className="flex flex-col gap-y-2 px-4">
              <Button
                variant="default"
                size="lg"
                onClick={clearFilters}
                className="h-12 w-full px-2 text-xs text-white hover:text-foreground"
              >
                Limpar tudo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setOpen(!open)}
                className="h-12 w-full px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Fechar Filtro
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    /* REMOVIDO: shouldScaleBackground={false} */
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={triggerElement} />
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filtros drawer</DrawerTitle>
          <DrawerDescription>Refine a sua busca abaixo.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2 max-h-[70vh] overflow-y-auto">{children}</div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 px-4 pb-4">
          <Button
            variant="default"
            size="lg"
            onClick={clearFilters}
            className="h-12 sm:w-2/4 px-2 text-xs text-white hover:text-foreground"
          >
            Limpar tudo
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setOpen(!open)}
            className="h-12 sm:w-2/4 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Fechar Filtro
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
