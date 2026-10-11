"use client";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Info, X } from "lucide-react";
import { calculate, money, type Budget } from "@/lib/finance";
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 0 24.4 13.2 36 4 26.8 15.6 40 20 26.8 24.4 36 36 24.4 26.8 20 40 15.6 26.8 4 36 13.2 24.4 0 20 13.2 15.6 4 4 15.6 13.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function CoinArt() {
  return (
    <svg
      className="coin-art"
      viewBox="0 0 240 220"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="122"
        cy="115"
        rx="103"
        ry="54"
        transform="rotate(-28 122 115)"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M24 111c33 50 131 68 185 28"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="3 5"
      />
      <g className="coin-float">
        <ellipse cx="123" cy="147" rx="54" ry="19" fill="#22231f" />
        <path
          d="M69 122v23c0 25 108 25 108 0v-23"
          fill="#d2e997"
          stroke="#22231f"
          strokeWidth="2"
        />
        <ellipse
          cx="123"
          cy="122"
          rx="54"
          ry="19"
          fill="#e6f3c7"
          stroke="#22231f"
          strokeWidth="2"
        />
        <path
          d="M79 133v14m10-10v15m11-12v16m12-14v16m12-15v16m12-17v16m12-19v16m11-20v14m10-22v14"
          stroke="#22231f"
        />
        <path
          d="M74 98v22c0 26 108 26 108 0V98"
          fill="#f9f6ef"
          stroke="#22231f"
          strokeWidth="2"
        />
        <ellipse
          cx="128"
          cy="98"
          rx="54"
          ry="19"
          fill="#fffaf2"
          stroke="#22231f"
          strokeWidth="2"
        />
        <path
          d="M84 109v14m10-10v15m11-12v16m12-14v16m12-15v16m12-17v16m12-19v16m11-20v14m10-22v14"
          stroke="#22231f"
        />
        <g transform="rotate(-17 130 74)">
          <path
            d="M76 61v21c0 26 108 26 108 0V61"
            fill="#e77a45"
            stroke="#22231f"
            strokeWidth="2"
          />
          <ellipse
            cx="130"
            cy="61"
            rx="54"
            ry="19"
            fill="#f7a87b"
            stroke="#22231f"
            strokeWidth="2"
          />
          <ellipse cx="130" cy="61" rx="42" ry="12" stroke="#22231f" />
          <text x="118" y="68" fill="#22231f" fontSize="25" fontWeight="700">
            ₹
          </text>
        </g>
      </g>
      <path d="m191 36 3 12 12 3-12 3-3 12-3-12-12-3 12-3Z" fill="#22231f" />
      <circle cx="44" cy="162" r="5" fill="#e77a45" />
      <circle cx="200" cy="170" r="3" fill="#22231f" />
      <path
        d="M44 58c4-12 16-15 22-8m-8-4 9 4-4 8"
        stroke="#22231f"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function GoalArt() {
  return (
    <svg
      className="goal-art"
      viewBox="0 0 100 88"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 43c0-16 17-25 34-25 16 0 25 8 29 20l9 4v16l-12 4-7 14H62l-2-9H40l-5 9H24l-2-16c-7-3-9-11-6-16"
        fill="#dfedb5"
        stroke="#292c25"
        strokeWidth="2"
      />
      <path
        d="m42 19 4-11 14 11"
        fill="#dfedb5"
        stroke="#292c25"
        strokeWidth="2"
      />
      <path
        d="M13 44C2 43 2 34 9 34c8 0 6 13 1 17"
        stroke="#292c25"
        strokeWidth="2"
      />
      <circle cx="73" cy="39" r="2" fill="#292c25" />
      <path
        d="M41 26h18"
        stroke="#292c25"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M48 6V1m20 8 4-4M29 9l-4-4"
        stroke="#e57943"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const el = ref.current;
    if (el && !el.open) el.showModal();
    return () => {
      if (el?.open) el.close();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={onClose}
    >
      <header className="modal-head">
        <div>
          <span className="eyebrow">YOUR MONEY, YOUR MOVE</span>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Forecast({
  budget,
  candidate,
}: {
  budget: Budget;
  candidate: Budget | null;
}) {
  const m = useMemo(() => calculate(budget), [budget]);
  const c = useMemo(
    () => (candidate ? calculate(candidate) : null),
    [candidate],
  );
  const [hover, setHover] = useState<number | null>(null);
  const actual = Array.from({ length: budget.day }, (_, i) => ({
    day: i + 1,
    balance: budget.transactions
      .filter((t) => t.day <= i + 1)
      .reduce((n, t) => n + (t.type === "income" ? t.amount : -t.amount), 0),
    events: [] as string[],
  }));
  const all = [...actual, ...m.forecast, ...(c?.forecast ?? [])],
    max = Math.max(1000000, ...all.map((p) => p.balance)) * 1.05,
    min = Math.min(0, ...all.map((p) => p.balance)) - max * 0.06;
  const x = (d: number) => 54 + ((d - 1) / 29) * 770,
    y = (v: number) => 185 - ((v - min) / (max - min)) * 160;
  const line = (
    points: {
      day: number;
      balance: number;
    }[],
  ) =>
    points
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${x(p.day).toFixed(1)},${y(p.balance).toFixed(1)}`,
      )
      .join(" ");
  const point = hover
    ? hover < budget.day
      ? actual.find((p) => p.day === hover)
      : m.forecast.filter((p) => p.day === hover).at(-1)
    : null;
  return (
    <section className="panel forecast-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE BIG PICTURE</span>
          <h2>Your month, mapped.</h2>
        </div>
        <span className="badge neutral">30-day view</span>
      </div>
      <div className="forecast-summary">
        <div>
          <span>Projected finish</span>
          <strong className={m.monthEnd < 0 ? "danger-text" : ""}>
            {money(m.monthEnd)}
          </strong>
          <small>after bills, essentials & planned savings</small>
        </div>
        <div className="chart-legends">
          <span>
            <i className="legend-line ink" />
            Actual
          </span>
          <span>
            <i className="legend-line orange" />
            Your plan
          </span>
          {c && (
            <span>
              <i className="legend-line dashed" />
              What-if
            </span>
          )}
        </div>
      </div>
      <div className="chart-wrap">
        <svg
          viewBox="0 0 870 226"
          role="img"
          aria-label={`30-day cash flow. Month-end forecast: ${money(m.monthEnd)}.${c ? ` After this decision: ${money(c.monthEnd)}.` : ""}`}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHover(
              Math.max(
                1,
                Math.min(
                  30,
                  Math.round(
                    ((((e.clientX - r.left) / r.width) * 870 - 54) / 770) * 29 +
                      1,
                  ),
                ),
              ),
            );
          }}
          onPointerLeave={() => setHover(null)}
        >
          {[0, max / 2, max / 1.05].map((v, i) => (
            <g key={i}>
              <line
                x1="54"
                x2="824"
                y1={y(v)}
                y2={y(v)}
                stroke="#eae8e0"
                strokeDasharray={v === 0 ? "0" : "3 5"}
              />
              <text x="0" y={y(v) + 4} fill="#59664f" fontSize="11">
                {v === 0 ? "₹0" : `₹${Math.round(v / 100000)}k`}
              </text>
            </g>
          ))}
          <line
            x1={x(budget.day)}
            x2={x(budget.day)}
            y1="20"
            y2="189"
            stroke="#d2d2c8"
            strokeDasharray="3 5"
          />
          <path
            d={`${line(m.forecast)} L${x(30)},${y(0)} L${x(budget.day)},${y(0)} Z`}
            fill="#e98243"
            fillOpacity=".06"
          />
          <path
            d={line(actual)}
            fill="none"
            stroke="#262921"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={line(m.forecast)}
            fill="none"
            stroke="#df7540"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {c && (
            <path
              d={line(c.forecast)}
              fill="none"
              stroke="#b33f32"
              strokeWidth="2.6"
              strokeDasharray="6 5"
            />
          )}
          <circle
            cx={x(budget.day)}
            cy={y(m.balance)}
            r="4.5"
            fill="#262921"
            stroke="white"
            strokeWidth="2"
          />
          <circle
            cx={x(30)}
            cy={y(m.monthEnd)}
            r="4.5"
            fill="#df7540"
            stroke="white"
            strokeWidth="2"
          />
          {c && (
            <circle
              cx={x(30)}
              cy={y(c.monthEnd)}
              r="4.5"
              fill="#b33f32"
              stroke="white"
              strokeWidth="2"
            />
          )}
          {[1, 5, 10, 15, 20, 25, 30].map((d) => (
            <text
              key={d}
              x={x(d)}
              y="216"
              textAnchor="middle"
              fill="#59664f"
              fontSize="11"
            >
              {d === 1 ? "Day 1" : d === 30 ? "Day 30" : d}
            </text>
          ))}
          {point && (
            <g>
              <line
                x1={x(point.day)}
                x2={x(point.day)}
                y1="20"
                y2="189"
                stroke="#aaa99b"
              />
              <circle
                cx={x(point.day)}
                cy={y(point.balance)}
                r="5"
                fill="#262921"
              />
            </g>
          )}
        </svg>
        {point && (
          <div className="chart-tooltip">
            <b>Day {point.day}</b> · {money(point.balance)}
            <small>
              {point.events.join(" · ") ||
                (point.day < budget.day
                  ? "Recorded wallet"
                  : "Projected after essentials")}
            </small>
          </div>
        )}
      </div>
      <div className="forecast-note">
        <Info size={14} />
        <span>
          {m.deficitDay
            ? `Your plan runs short on Day ${m.deficitDay}.`
            : `Assumes ${money(budget.essentials)}/day for essentials; ${money(budget.reserve)} stays protected.`}{" "}
          {c?.deficitDay &&
            `This decision creates a shortfall on Day ${c.deficitDay}.`}
        </span>
      </div>
      <details className="forecast-details">
        <summary>Explore daily balances as a table</summary>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Daily cash-flow table"
        >
          <table>
            <caption>Recorded and projected balances, in rupees</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">{c ? "Current plan" : "Wallet balance"}</th>
                {c && <th scope="col">After decision</th>}
                <th scope="col">Scheduled events</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const p =
                  day < budget.day
                    ? actual.find((p) => p.day === day)
                    : m.forecast.filter((p) => p.day === day).at(-1);
                const next = c?.forecast.filter((p) => p.day === day).at(-1);
                return (
                  <tr key={day}>
                    <th scope="row">
                      {day}
                      {day === budget.day ? " (today)" : ""}
                    </th>
                    <td>{money(p?.balance ?? m.balance)}</td>
                    {c && (
                      <td>{money(next?.balance ?? p?.balance ?? m.balance)}</td>
                    )}
                    <td>
                      {p?.events.join(", ") ||
                        (day < budget.day
                          ? "Recorded history"
                          : "Daily essentials")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
