import * as React from "react";

type AnyProps = Record<string, unknown>;

type MotionPassthroughProps<T extends keyof JSX.IntrinsicElements> =
  JSX.IntrinsicElements[T] & {
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    transition?: unknown;
    variants?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
    whileInView?: unknown;
    viewport?: unknown;
    layout?: unknown;
    layoutId?: unknown;
    custom?: unknown;
  };

const componentCache = new Map<string, React.ComponentType<AnyProps>>();

function createMotionElement(tag: string) {
  const MotionElement = React.forwardRef<HTMLElement, AnyProps>(function MotionElement(
    props,
    ref
  ) {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      whileTap: _whileTap,
      whileInView: _whileInView,
      viewport: _viewport,
      layout: _layout,
      layoutId: _layoutId,
      custom: _custom,
      ...rest
    } = props;

    return React.createElement(tag, { ...rest, ref });
  });

  MotionElement.displayName = `motion.${tag}`;
  return MotionElement;
}

export const motion = new Proxy(
  {},
  {
    get: (_target, key) => {
      const tag = String(key);
      if (!componentCache.has(tag)) {
        componentCache.set(tag, createMotionElement(tag));
      }
      return componentCache.get(tag);
    },
  }
) as {
  [K in keyof JSX.IntrinsicElements]: React.ComponentType<MotionPassthroughProps<K>>;
};

type AnimatePresenceProps = {
  children: React.ReactNode;
  mode?: "sync" | "wait" | "popLayout" | string;
  initial?: boolean;
  custom?: unknown;
  onExitComplete?: () => void;
};

export function AnimatePresence({ children }: AnimatePresenceProps) {
  return <>{children}</>;
}

export type Variants = Record<string, AnyProps>;
