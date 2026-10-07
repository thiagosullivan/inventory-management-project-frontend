import { Link } from "react-router";
import { AlertCircle, PackageX, Clock, CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format-date";
import type { StockAlertProduct } from "@/types/stock.types";

type AlertVariant = "warning" | "destructive" | "default";

interface StockAlertSectionProps {
  title: string;
  description?: string;
  items: StockAlertProduct[];
  variant?: AlertVariant;
  showMinStock?: boolean;
  showExpiryDate?: boolean;
  emptyMessage: string;
  seeAllHref?: string;
  icon?: "alert" | "package" | "clock" | "calendar";
}

const ICONS = {
  alert: AlertCircle,
  package: PackageX,
  clock: Clock,
  calendar: CalendarX,
} as const;

const BADGE_VARIANT: Record<
  AlertVariant,
  "warning" | "destructive" | "outline"
> = {
  warning: "warning",
  destructive: "destructive",
  default: "outline",
};

export function StockAlertSection({
  title,
  description,
  items,
  variant = "default",
  showMinStock = false,
  showExpiryDate = false,
  emptyMessage,
  seeAllHref,
  icon = "alert",
}: StockAlertSectionProps) {
  const Icon = ICONS[icon];
  const isEmpty = items.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {title}
              <Badge variant={BADGE_VARIANT[variant]}>{items.length}</Badge>
            </CardTitle>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {seeAllHref && !isEmpty && (
          <Button variant="ghost" size="sm" render={<Link to={seeAllHref} />}>
            Ver todos
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {isEmpty ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {emptyMessage}
          </p>
        ) : (
          <div className="divide-y">
            {items.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {/* Imagem */}
                <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <PackageX className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Nome + SKU */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {product.sku ?? "Sem SKU"}
                  </p>
                </div>

                {/* Coluna: quantidade */}
                <div className="text-sm text-right flex-shrink-0">
                  <span className="font-medium">{product.quantity}</span>
                  {showMinStock && product.minStock !== null && (
                    <span className="text-muted-foreground">
                      {" "}
                      / {product.minStock}
                    </span>
                  )}
                </div>

                {/* Coluna: validade */}
                {showExpiryDate && product.expiryDate && (
                  <div className="text-xs text-muted-foreground text-right flex-shrink-0 w-20">
                    {formatDate(product.expiryDate)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
