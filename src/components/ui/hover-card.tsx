"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type HoverCardContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDelay: number;
  closeDelay: number;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function useHoverCardContext() {
  const context = React.useContext(HoverCardContext);
  if (!context) throw new Error("HoverCard components must be used within <HoverCard />");
  return context;
}

export function HoverCard({
  children,
  openDelay = 200,
  closeDelay = 80,
}: {
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const value = React.useMemo(
    () => ({ open, setOpen, openDelay, closeDelay, triggerRef }),
    [open, openDelay, closeDelay]
  );

  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>;
}

export function HoverCardTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setOpen, openDelay, closeDelay, triggerRef } = useHoverCardContext();
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const setTriggerNode = React.useCallback(
    (node: HTMLSpanElement | null) => {
      triggerRef.current = node;
    },
    [triggerRef]
  );

  React.useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const scheduleOpen = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), openDelay);
  };

  const scheduleClose = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), closeDelay);
  };

  return (
    <span
      ref={setTriggerNode}
      className="block w-full"
      onPointerEnter={scheduleOpen}
      onPointerLeave={scheduleClose}
      onFocus={scheduleOpen}
      onBlur={scheduleClose}
    >
      {children}
    </span>
  );
}

export function HoverCardContent({
  className,
  children,
  sideOffset = 8,
}: {
  className?: string;
  children: React.ReactNode;
  sideOffset?: number;
}) {
  const { open, setOpen, openDelay, closeDelay, triggerRef } = useHoverCardContext();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (openTimer.current) window.clearTimeout(openTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const scheduleOpen = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), openDelay);
  };

  const scheduleClose = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), closeDelay);
  };

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const padding = 8;
    const idealLeft = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    const left = Math.min(
      Math.max(idealLeft, padding),
      Math.max(padding, viewportWidth - contentRect.width - padding)
    );

    const aboveTop = triggerRect.top - sideOffset - contentRect.height;
    const belowTop = triggerRect.bottom + sideOffset;
    const top = aboveTop >= padding ? aboveTop : Math.min(belowTop, viewportHeight - padding);

    setPos({ top, left });
  }, [sideOffset, triggerRef]);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition, children]);

  React.useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={contentRef}
      onPointerEnter={scheduleOpen}
      onPointerLeave={scheduleClose}
      className={cn(
        "z-50 w-auto min-w-[240px] max-w-[420px] rounded-xl border border-border bg-card p-3 text-sm text-white shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{ position: "fixed", top: pos.top, left: pos.left }}
    >
      {children}
    </div>,
    document.body
  );
}
