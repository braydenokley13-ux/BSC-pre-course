"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GlossaryGroup } from "@/lib/concepts";
import { CONCEPT_CARDS } from "@/lib/concepts";
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
  const router = useRouter();
  const [open, setOpen] = useState(initiallyOpen);
  const [query, setQuery] = useState("");
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

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
        <span className="text-[#94a3b8] text-xs">{open ? "▲" : "▼"}</span>
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
              <p className="text-xs text-[#94a3b8]">No terms found.</p>
            ) : (
              filtered.map((group) => (
                <div key={group.group} className="mb-4">
                  <p className="text-[#60a5fa] text-xs font-semibold mb-2 tracking-wide uppercase">{group.group}</p>
                  {group.terms.map((term) => {
                    const highlighted = highlightedTermIds.includes(term.id);
                    const isExpanded = expandedTermId === term.id;
                    const linkedCard = CONCEPT_CARDS.find((c) => c.termIds.includes(term.id));

                    return (
                      <div
                        key={term.id}
                        className={`rounded border mb-2 transition-colors ${
                          highlighted
                            ? "border-[#2563eb]/50 bg-[#0f172a]"
                            : isExpanded
                            ? "border-[#c9a84c]/40 bg-[#0d1117]"
                            : "border-[#334155] bg-[#111827]"
                        }`}
                      >
                        <button
                          type="button"
                          className="w-full text-left px-2 py-2 hover:bg-[#0f172a] transition-colors rounded"
                          onClick={() => {
                            const next = isExpanded ? null : term.id;
                            setExpandedTermId(next);
                            onTermSelect?.(term.id);
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-[#e5e7eb] font-semibold">{term.term}</p>
                            <span className="text-[#6b7280] text-[10px] flex-shrink-0">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                          <p className="text-xs text-[#cbd5e1] leading-relaxed mt-1">{term.def}</p>
                          <p className="text-[11px] text-[#94a3b8] leading-relaxed mt-1">Why it matters: {term.why}</p>
                        </button>

                        {/* Expanded concept depth panel */}
                        {isExpanded && linkedCard && (
                          <div className="px-2 pb-3 border-t border-[#1e293b] mt-1">
                            <p className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mt-2 mb-1">
                              ◈ Full Concept — {linkedCard.title}
                            </p>
                            <p className="text-xs text-[#e5e7eb] leading-relaxed mb-1">{linkedCard.body}</p>
                            <p className="text-[11px] text-[#94a3b8] leading-relaxed italic mb-3">{linkedCard.note}</p>
                            <button
                              type="button"
                              className="text-[11px] font-mono text-[#3b82f6] hover:text-[#60a5fa] transition-colors tracking-wide"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/catalog?concept=${linkedCard.id}`);
                              }}
                            >
                              → See full concept card
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-[#94a3b8]">
          {total} terms across cap rules, contracts, trades, analytics, and team strategy.
        </p>
      )}
    </div>
  );
}
