import type { ReactNode } from "react";
import { cn } from "~/utils/common";

interface MarketplaceItem {
  name: string;
  icon: ReactNode;
  discount?: string;
  price?: string;
}

interface MarketplaceRowProps {
  items: MarketplaceItem[];
  className?: string;
}

export function MarketplaceRow({ items, className }: MarketplaceRowProps) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.name}
            className={cn(
              "bg-gray-200 dark:bg-gray-800 p-2 text-sm flex flex-col justify-between",
              {
                "rounded-l-sm": isFirst,
                "rounded-r-sm": isLast,
              }
            )}
          >
            {item.name && <div className="mb-1">{item.name}</div>}
            <div className="flex gap-2 items-center">
              {item.icon}
              {(item.discount || item.price) && (
                <div className="text-xs">
                  {item.discount && (
                    <div className="font-bold">{item.discount}</div>
                  )}
                  {item.price && <div>{item.price}</div>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
