import React from "react";
import { COLORS } from "../lib/theme.js";

export function Card({ children, style, ...rest }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Pill({ children, tone = "flow" }) {
  const bg = { flow: COLORS.flow, amber: "#FCF0DA", coral: "#FBEAE5", sky: "#EAF3F8" }[tone];
  const fg = { flow: COLORS.ink, amber: "#93691E", coral: COLORS.coral, sky: "#2C6E8E" }[tone];
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color: fg }}>
      {children}
    </span>
  );
}

export function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt style={{ color: COLORS.muted }}>{label}</dt>
      <dd style={{ color: COLORS.ink }}>{value}</dd>
    </div>
  );
}

export function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium" style={{ color: COLORS.ink }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ border: `1px solid ${COLORS.mist}` }}
      />
    </div>
  );
}

export function NumInput({ v, on }) {
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => on(Number(e.target.value))}
      className="w-20 rounded-md px-2 py-1 text-sm"
      style={{ border: `1px solid ${COLORS.mist}` }}
    />
  );
}

export function Table({ columns, rows, empty }) {
  if (rows.length === 0) {
    return <p className="text-sm mt-3" style={{ color: COLORS.muted }}>{empty}</p>;
  }
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.mist}` }}>
            {columns.map((c) => (
              <th key={c} className="text-left font-medium py-2 pr-4" style={{ color: COLORS.muted }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${COLORS.mist}` }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4" style={{ color: COLORS.ink }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
