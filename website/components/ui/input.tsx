import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-input shadow border-input focus-visible:border-ring focus-visible:ring-ring/30 " +
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive " +
          "dark:aria-invalid:border-destructive/50 rounded-xl border px-4 py-3.5 text-base transition-colors file:h-6 " +
          "file:text-xs/relaxed file:font-medium focus-visible:ring-2 aria-invalid:ring-2 file:text-foreground " +
          "placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 " +
          "file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
