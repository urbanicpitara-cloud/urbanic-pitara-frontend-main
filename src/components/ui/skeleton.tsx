import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 border border-gray-200 shadow-sm dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:border-gray-700",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton }
