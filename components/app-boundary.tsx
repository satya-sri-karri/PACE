import { Component, type ReactNode } from "react";

/** Also catches a stale, lazy-loaded asset after a new deployment. */
export class AppBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="recovery-screen">
          <span className="eyebrow">PACE · YOUR MONEY STUDIO</span>
          <h1>Let’s pick up where you left off.</h1>
          <p>
            This view couldn’t open. Reload to load the latest version. Your
            saved plan stays on this device.
          </p>
          <button className="button" onClick={() => window.location.reload()}>
            Reload PACE
          </button>
        </main>
      );
    return this.props.children;
  }
}
