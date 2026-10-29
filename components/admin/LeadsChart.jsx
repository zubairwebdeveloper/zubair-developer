"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils/cn";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const formatNumber = (value) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

function usePrefersReducedMotion() {
  const subscribe = (callback) => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  };
  const getSnapshot = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function ChartTooltip({ active, payload, total, mode }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const share = total > 0 ? Math.round((point.leads / total) * 100) : 0;

  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm shadow-md"
      style={{
        background: "var(--popover)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <p className="font-medium">{point.date ?? point.label}</p>
      <p style={{ color: "var(--muted-foreground)" }}>
        {point.leads} {point.leads === 1 ? "lead" : "leads"}
        {total > 0 ? ` (${share}% of period)` : ""}
      </p>
      {mode === "total" ? (
        <p style={{ color: "var(--muted-foreground)" }}>
          Running total: {point.cumulative}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-card px-3.5 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold leading-tight tracking-tight">
        {value}
      </dd>
      {hint ? (
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Toggle({ pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "min-h-8 rounded-md px-3 text-sm font-medium transition-colors motion-reduce:transition-none",
        pressed
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:text-foreground",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chart                                                                     */
/* -------------------------------------------------------------------------- */

export function LeadsChart({ data }) {
  const [mode, setMode] = useState("daily"); // daily | total
  const [showAverage, setShowAverage] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const reducedMotion = usePrefersReducedMotion();
  const gradientId = `leads-fill-${useId().replace(/:/g, "")}`;

  const points = useMemo(() => {
    return (data ?? []).reduce(
      (result, point) => {
        const cumulative = result.total + point.leads;
        return {
          total: cumulative,
          points: [...result.points, { ...point, cumulative }],
        };
      },
      { total: 0, points: [] },
    ).points;
  }, [data]);

  const stats = useMemo(() => {
    const total = points.reduce((sum, point) => sum + point.leads, 0);
    const days = points.length;
    const average = days > 0 ? total / days : 0;

    const busiestIndex = points.reduce(
      (best, point, index) =>
        point.leads > (points[best]?.leads ?? -1) ? index : best,
      0,
    );
    const busiest = total > 0 ? points[busiestIndex] : null;

    // Compare the second half of the period with the first half.
    const mid = Math.floor(days / 2);
    const first = points
      .slice(0, mid)
      .reduce((sum, point) => sum + point.leads, 0);
    const second = points
      .slice(mid)
      .reduce((sum, point) => sum + point.leads, 0);
    const trend =
      days >= 4 && first > 0
        ? Math.round(((second - first) / first) * 100)
        : null;

    return { total, days, average, busiest, busiestIndex, trend };
  }, [points]);

  const { total, days, average, busiest, busiestIndex, trend } = stats;

  const summary =
    total === 0
      ? "No leads in this period."
      : `${total} ${total === 1 ? "lead" : "leads"} in this period. Busiest day: ${busiest.date ?? busiest.label} (${busiest.leads}).`;

  /* Empty state */
  if (days === 0 || total === 0) {
    return (
      <figure className="flex flex-col gap-2">
        <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-medium">No leads in this period</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When someone sends an inquiry through your site, it will appear
            here.
          </p>
        </div>
        <figcaption className="sr-only">{summary}</figcaption>
      </figure>
    );
  }

  const barOpacity = (index) => {
    if (activeIndex !== null) return index === activeIndex ? 1 : 0.45;
    return index === busiestIndex ? 1 : 0.6;
  };

  return (
    <figure className="flex min-w-0 flex-col gap-4">
      {/* Summary stats */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Total leads"
          value={total}
          hint={`Over ${days} ${days === 1 ? "day" : "days"}`}
        />
        <Stat
          label="Daily average"
          value={formatNumber(Math.round(average * 10) / 10)}
        />
        <Stat
          label="Busiest day"
          value={busiest.leads}
          hint={busiest.date ?? busiest.label}
        />
        <Stat
          label="Recent trend"
          value={
            trend === null
              ? "Not enough data"
              : `${trend > 0 ? "+" : ""}${trend}%`
          }
          hint={trend === null ? undefined : "Second half vs first half"}
        />
      </dl>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Chart view"
          className="flex rounded-lg border border-border bg-card p-0.5"
        >
          <Toggle pressed={mode === "daily"} onClick={() => setMode("daily")}>
            Daily
          </Toggle>
          <Toggle pressed={mode === "total"} onClick={() => setMode("total")}>
            Running total
          </Toggle>
        </div>

        {mode === "daily" ? (
          <button
            type="button"
            aria-pressed={showAverage}
            onClick={() => setShowAverage((value) => !value)}
            className={cn(
              "flex min-h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none",
              focusRing,
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-0 w-5 border-t-2 border-dashed",
                showAverage
                  ? "border-foreground/70"
                  : "border-muted-foreground/40",
              )}
            />
            <span>{showAverage ? "Hide average" : "Show average"}</span>
          </button>
        ) : null}
      </div>

      {/* Chart */}
      <div
        role="img"
        aria-label={`${mode === "daily" ? "Bar chart of new leads per day" : "Area chart of the running total of leads"}. ${summary}`}
        className="relative w-full min-w-0"
        style={{ width: "100%", height: "16rem", minHeight: "16rem" }}
      >
        <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={0}>
          {mode === "daily" ? (
            <BarChart
              data={points}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={axisTick}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={axisTick}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                content={<ChartTooltip total={total} mode="daily" />}
              />
              {showAverage ? (
                <ReferenceLine
                  y={average}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                  label={{
                    value: `Avg ${formatNumber(Math.round(average * 10) / 10)}`,
                    position: "insideTopRight",
                    fill: "var(--muted-foreground)",
                    fontSize: 12,
                  }}
                />
              ) : null}
              <Bar
                dataKey="leads"
                name="Leads"
                radius={[4, 4, 0, 0]}
                isAnimationActive={!reducedMotion}
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {points.map((point, index) => (
                  <Cell
                    key={`${point.date ?? point.label}-${index}`}
                    fill="var(--brand)"
                    fillOpacity={barOpacity(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart
              data={points}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--brand)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--brand)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={axisTick}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={axisTick}
              />
              <Tooltip
                cursor={{
                  stroke: "var(--muted-foreground)",
                  strokeDasharray: "4 4",
                }}
                content={<ChartTooltip total={total} mode="total" />}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Running total"
                stroke="var(--brand)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={!reducedMotion}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {mode === "daily" ? (
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: "var(--brand)" }}
            />
            Busiest day
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: "var(--brand)", opacity: 0.6 }}
            />
            Other days
          </span>
        </p>
      ) : null}

      <figcaption className="text-sm text-muted-foreground">
        {summary}
      </figcaption>

      {/* Accessible, readable alternative to the chart */}
      <details className="group rounded-xl border border-border bg-card">
        <summary
          className={cn(
            "cursor-pointer select-none rounded-xl px-4 py-3 text-sm font-medium",
            focusRing,
          )}
        >
          View data as a table
        </summary>
        <div className="max-h-72 overflow-auto border-t border-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">New leads per day</caption>
            <thead className="sticky top-0 bg-card text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  Leads
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((point, index) => (
                <tr
                  key={`${point.date ?? point.label}-${index}`}
                  className="border-t border-border/60"
                >
                  <td className="px-4 py-2">{point.date ?? point.label}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {point.leads}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
