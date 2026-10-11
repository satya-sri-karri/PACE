import { lazy, Suspense } from "react";
import OverviewView from "@/components/views/overview-view";
import { NAV } from "@/lib/navigation";
const LabView = lazy(() => import("@/components/views/lab-view"));
const ActivityView = lazy(() => import("@/components/views/activity-view"));
const PlanView = lazy(() => import("@/components/views/plan-view"));
const AppDialog = lazy(() => import("@/components/views/dialog-view"));
function ViewLoading() {
  return (
    <section className="panel view-loading" role="status">
      Opening your money studio…
    </section>
  );
}
import {
  Plus,
  X,
  CalendarDays,
  Settings2,
  Undo2,
  Check,
  RotateCcw,
  Info,
  CircleHelp,
} from "lucide-react";

import { Star } from "@/components/pace-visuals";
import { usePace } from "@/hooks/use-pace";

export function AppLayout() {
  const {
    budget,
    history,
    loaded,
    storageWarning,
    setStorageWarning,
    view,
    modal,
    error,
    setError,
    notice,
    setNotice,
    open,
    move,
    undo,
  } = usePace();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <button
          type="button"
          className="brand"
          onClick={() => move("overview")}
          aria-label="Pace home"
        >
          <Star />
          pace<span className="brand-dot">.</span>
        </button>
        <div className="brand-caption">A LITTLE MONEY. A LOT OF LIFE.</div>
        <nav aria-label="Main navigation">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={view === n.id ? "nav-item active" : "nav-item"}
              aria-current={view === n.id ? "page" : undefined}
              onClick={() => move(n.id)}
            >
              <n.icon size={19} strokeWidth={1.7} />
              <span>{n.label}</span>
              {n.id === "lab" && <span className="tiny-new">TRY</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Star />
          <p>
            Good plans.
            <br />
            <em>Better weekends.</em>
          </p>
          <svg viewBox="0 0 140 45" aria-hidden="true">
            <path
              d="M5 20c20 20 49-16 64 0s27 19 55 1m-15-5 16 4-7 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => open({ kind: "help" })}>
            <CircleHelp size={18} />
            How Pace works
          </button>
          <button
            className="nav-item"
            onClick={() => open({ kind: "settings" })}
          >
            <Settings2 size={18} />
            Plan settings
          </button>
          <div className="profile">
            <div className="avatar">Y</div>
            <div>
              <strong>Your money studio</strong>
              <small>Private to this browser</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <Star />
            pace.
          </div>
          <div className="breadcrumb">
            Your workspace <span>/</span>{" "}
            <strong>{NAV.find((n) => n.id === view)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="saved-status">
              <span className="status-dot" />
              {loaded
                ? storageWarning
                  ? "Session only"
                  : "Saved on this device"
                : "Loading your plan"}
            </span>
            <button
              className="icon-button"
              onClick={undo}
              disabled={!history.length}
              aria-label="Undo last action"
              title="Undo last action"
            >
              <Undo2 size={18} />
            </button>
            <button
              className="day-chip"
              onClick={() => open({ kind: "settings" })}
            >
              <CalendarDays size={15} />
              Day {budget.day}
              <span>/ 30</span>
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="heading-eyebrow">
                <span className="orange-dot" />
                ₹10K CHALLENGE · 30 DAYS
              </div>
              <h1>
                {view === "overview" ? (
                  <>
                    Small budget.
                    <br className="mobile-break" /> <em>Big possibilities.</em>
                  </>
                ) : view === "lab" ? (
                  <>
                    A safe space for <em>what if.</em>
                  </>
                ) : view === "activity" ? (
                  <>
                    Every little <em>money move.</em>
                  </>
                ) : (
                  <>
                    Make room for <em>future you.</em>
                  </>
                )}
              </h1>
              <p>
                {view === "overview"
                  ? "Keep your essentials covered. Keep a little room for living."
                  : view === "lab"
                    ? "Try a decision. See the ripple. Make your move."
                    : view === "activity"
                      ? "What came in, what went out, and what you saved."
                      : "Bills, renewals, and dreams. All part of the same plan."}
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="button outline"
                onClick={() => open({ kind: "income" })}
              >
                <Plus size={16} />
                Add income
              </button>
              <button
                className="button"
                onClick={() => open({ kind: "expense" })}
              >
                <Plus size={16} />
                Add expense
              </button>
            </div>
          </div>
          {storageWarning && (
            <div className="storage-warning" role="status">
              <Info size={16} />
              {storageWarning}
              <button
                onClick={() => setStorageWarning()}
                aria-label="Dismiss notice"
              >
                <X size={15} />
              </button>
            </div>
          )}
          {error && view !== "lab" && !modal && (
            <div className="global-error" role="alert">
              {error}
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}
          {view === "overview" && <OverviewView />}
          {view === "lab" && (
            <Suspense fallback={<ViewLoading />}>
              <LabView />
            </Suspense>
          )}
          {view === "activity" && (
            <Suspense fallback={<ViewLoading />}>
              <ActivityView />
            </Suspense>
          )}
          {view === "plan" && (
            <Suspense fallback={<ViewLoading />}>
              <PlanView />
            </Suspense>
          )}
          <footer className="footer">
            <span>
              <Star />A little more clarity. A little less money stress.
            </span>
            <div>
              <span>30-day sandbox · Local data</span>
              <button onClick={() => open({ kind: "reset" })}>
                <RotateCcw size={13} />
                Reset demo
              </button>
            </div>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={view === n.id ? "active" : ""}
            aria-current={view === n.id ? "page" : undefined}
            onClick={() => move(n.id)}
          >
            <n.icon size={20} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Check size={16} />
          </span>
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Suspense fallback={null}>
          <AppDialog />
        </Suspense>
      )}
    </div>
  );
}
export default AppLayout;
