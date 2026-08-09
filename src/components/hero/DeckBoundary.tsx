"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps a failed deck from taking the whole hero down with it.
 *
 * R3F portals the scene into its own reconciler root, so an error thrown while
 * the deck renders — a rejected `createImageBitmap` on a truncated atlas, say —
 * tears down that root while leaving the `<canvas>` element sitting in the DOM.
 * What the visitor gets is a black rectangle where the hero should be, with the
 * copy still floating on top of it. It survives a reload, because what is
 * wrong is the cached response rather than any runtime state, so the only way
 * out is clearing site data. That is not a failure mode a client-facing demo
 * can have.
 *
 * Scoped to the deck alone, which is why this sits inside the Canvas rather
 * than around it: the nebula, the lights and the fog are all siblings and keep
 * rendering. A hero with a backdrop and no cards is a quiet degradation. A
 * black hole with a headline over it reads as a broken site.
 *
 * Deliberately has no retry. A decode failure here is not transient — the same
 * bytes come back from the same cache entry every time — so a retry loop would
 * just spin. Recovering properly means fixing what got cached.
 */
export default class DeckBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Loud on purpose: this path is silent from the outside — the page looks
    // merely empty — so without a log there is nothing to find it by.
    console.error(
      "[hero] deck failed to render; falling back to the backdrop alone.",
      error,
    );
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
