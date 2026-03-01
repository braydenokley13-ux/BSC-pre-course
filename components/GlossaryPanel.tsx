"use client";

import { useMemo, useState } from "react";
import type { GlossaryGroup } from "@/lib/concepts";
import { TRACK_101_GLOSSARY_OVERRIDES } from "@/lib/track101Content";

interface GlossaryPanelProps {
  groups: GlossaryGroup[];
  highlightedTermIds?: string[];
  title?: string;
  initiallyOpen?: boolean;
  onTermSelect?: (termId: string) => void;
  track?: string;
}

export function GlossaryPanel({
  groups,
  highlightedTermIds = [],
  title,
  initiallyOpen = false,
  onTermSelect,
  track = "201",
}: GlossaryPanelProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const [query, setQuery] = useState("");

  // Apply Track 101 simplified definitions when needed
  const resolvedGroups = useMemo(() => {
    if (track !== "101") return groups;
    return groups.map((group) => ({
      ...group,
      terms: group.terms.map((term) => {
        const override = TRACK_101_GLOSSARY_OVERRIDES[term.id];
        if (!override) return term;
        return { ...term, def: override.def, why: override.why };
      }),
    }));
  }, [groups, track]);

  const total = useMemo(
    () => resolvedGroups.reduce((sum, group) => sum + group.terms.length, 0),
    [resolvedGroups]
  );

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return resolvedGroups
      .map((group) => ({
        ...group,
        terms: group.terms.filter((term) => {
          if (!normalized) return true;
          const haystack = `${term.term} ${term.def} ${term.why}`.toLowerCase();
          return haystack.includes(normalized);
        }),
      }))
      .filter((group) => group.terms.length > 0);
  }, [resolvedGroups, normalized]);

  const heading = title ?? `Game Glossary (${total})`;

  return (
    <div className="bsc-card p-4">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="bsc-section-title mb-0">{heading}</span>
        <span className="text-[#64748b] text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="mt-3">
          <input
            className="bsc-input h-9 text-xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms"
          />
          <div className="mt-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-[#64748b]">No terms found.</p>
            ) : (
              filtered.map((group) => (
                <div key={group.group} className="mb-4">
                  <p className="text-[#2563eb] text-xs font-semibold mb-2 tracking-wide uppercase">{group.group}</p>
                  {group.terms.map((term) => {
                    const highlighted = highlightedTermIds.includes(term.id);
                    return (
                      <button
                        key={term.id}
                        type="button"
                        className={`w-full text-left rounded border px-2 py-2 mb-2 transition-colors ${
                          highlighted
                            ? "border-[#bfdbfe] bg-[#eff6ff]"
                            : "border-[#e2e8f0] hover:border-[#2563eb]/40 hover:bg-[#f8fafc]"
                        }`}
                        onClick={() => onTermSelect?.(term.id)}
                      >
                        <p className="text-xs text-[#0f172a] font-semibold">{term.term}</p>
                        <p className="text-xs text-[#374151] leading-relaxed mt-1">{term.def}</p>
                        <p className="text-[11px] text-[#64748b] leading-relaxed mt-1">Why it matters: {term.why}</p>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-[#64748b]">
          {total} terms across cap rules, contracts, trades, analytics, and team strategy.
        </p>
      )}
    </div>
  );
}
