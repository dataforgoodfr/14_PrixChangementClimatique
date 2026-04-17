"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  Children,
  isValidElement,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────────────────────────────────────

interface PanelContextValue {
  onClose: () => void;
  showCloseButton: boolean;
}

const PanelContext = createContext<PanelContextValue | null>(null);

function usePanelContext() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("Panel sub-components must be used within <Panel>");
  return ctx;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PanelTitle({
  children,
  size = "large",
}: {
  children: ReactNode;
  size?: "small" | "large";
}) {
  return (
    <p
      className={cn(
        "font-semibold text-gray-900",
        size === "large" ? "pt-30 text-3xl" : "text-lg",
      )}
    >
      {children}
    </p>
  );
}

function PanelSubtitle({
  children,
  size = "large",
}: {
  children: ReactNode;
  size?: "small" | "large";
}) {
  return (
    <p
      className={cn(size === "large" ? "text-xs" : "text-xs", "text-gray-500")}
    >
      {children}
    </p>
  );
}

function PanelHeader({
  children,
  size = "large",
}: {
  children: ReactNode;
  size?: "small" | "large";
}) {
  const { onClose, showCloseButton } = usePanelContext();
  return (
    <div
      className={cn(
        "flex items-start justify-between px-4 border-b border-gray-200 shrink-0",
        size === "large" ? "py-3" : "py-2",
      )}
    >
      <div className="flex flex-col gap-0.5 min-w-0">{children}</div>
      {showCloseButton && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 -mr-1 shrink-0"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function PanelContent({ children }: { children: ReactNode }) {
  return <div className="flex-1 overflow-y-auto">{children}</div>;
}

function PanelActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">{children}</div>
  );
}

function PanelFooter({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-gray-200 px-4 py-4 shrink-0">
      {children}
    </div>
  );
}

// Controls children are extracted by Panel and rendered outside the slide div.
function PanelControls({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
PanelControls.displayName = "Panel.Controls";

// ─── Main Panel component ─────────────────────────────────────────────────────

// Full Tailwind class strings must be statically present — no dynamic construction.
type PanelZIndex = "z-10" | "z-20" | "z-30" | "z-40" | "z-50";

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** "ltr" slides in from the left; "rtl" slides in from the right. */
  dir?: "ltr" | "rtl";
  /** Panel width in px on sm+ screens. Full-width on mobile. Default: 360. */
  width?: number;
  /** Tailwind z-index class for the panel. Controls sit one step above. Default: "z-20". */
  zIndex?: PanelZIndex;
  /** Show an X close button in the header. Default: true. */
  showCloseButton?: boolean;
  children: ReactNode;
}

function Panel({
  isOpen,
  onClose,
  dir = "ltr",
  width = 400,
  zIndex = "z-20",
  showCloseButton = true,
  children,
}: PanelProps) {
  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Separate Panel.Controls from the rest of the children
  const childArray = Children.toArray(children);
  const controls = childArray.filter(
    (child) =>
      isValidElement(child) &&
      (child.type as { displayName?: string }).displayName === "Panel.Controls",
  );
  const body = childArray.filter(
    (child) =>
      !(
        isValidElement(child) &&
        (child.type as { displayName?: string }).displayName ===
          "Panel.Controls"
      ),
  );

  const isLtr = dir === "ltr";

  const panelClasses = cn(
    zIndex,
    "absolute top-0 h-full w-full bg-white shadow-xl flex flex-col",
    "sm:w-[var(--panel-w)]",
    "transition-transform duration-300 ease-in-out",
    isLtr ? "left-0" : "right-0",
    isOpen ? "translate-x-0" : isLtr ? "-translate-x-full" : "translate-x-full",
  );

  const controlsClassName = cn(
    "absolute top-4 bottom-4 flex flex-col justify-between duration-300 ease-in-out",
    isLtr ? "items-start" : "items-end",
    zIndex,
    isLtr
      ? [
          "transition-[left]",
          isOpen ? "left-[calc(var(--panel-w)_+_1rem)]" : "left-4",
        ]
      : [
          "transition-[right]",
          isOpen ? "right-[calc(var(--panel-w)_+_1rem)]" : "right-4",
        ],
    isOpen && "hidden sm:flex",
  );

  return (
    <PanelContext.Provider value={{ onClose, showCloseButton }}>
      {/* display:contents makes this wrapper invisible to layout while cascading --panel-w */}
      <div
        style={{ "--panel-w": `${width}px` } as React.CSSProperties}
        className="contents"
      >
        <div className={panelClasses}>{body}</div>
        {controls.length > 0 && (
          <div className={controlsClassName}>{controls}</div>
        )}
      </div>
    </PanelContext.Provider>
  );
}

// Attach sub-components for compound usage: <Panel.Header />, etc.
Panel.Header = PanelHeader;
Panel.Title = PanelTitle;
Panel.Subtitle = PanelSubtitle;
Panel.Content = PanelContent;
Panel.Footer = PanelFooter;
Panel.Actions = PanelActions;
Panel.Controls = PanelControls;

export { Panel };
