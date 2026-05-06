import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { TrendingUp, Globe, Plus } from "lucide-react";
import {
  OPPORTUNITY_TYPE_LABELS,
  formatRelativeTime,
} from "@spectrumcircle/shared";
import type { BusinessOpportunity, OpportunityType } from "@spectrumcircle/shared";

export default async function BusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: opportunities } = (await (supabase as any)
    .from("business_opportunities")
    .select(
      "id, title, description, company_name, opportunity_type, location, is_remote, tags, created_at, owner_id, profiles(display_name, avatar_url, role)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(30)) as { data: BusinessOpportunity[] | null };

  const TYPE_COLORS: Record<OpportunityType, string> = {
    partnership: "#4BADE8",
    investment: "#4CAF7D",
    mentorship: "#9B59B6",
    project: "#FF9A3C",
    other: "#6B7280",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-nunito text-text mb-1">
            Business Opportunities
          </h1>
          <p className="text-text-muted text-sm">
            Connect autistic entrepreneurs with collaborators, investors, and
            mentors.
          </p>
        </div>
        <Link
          href="/business/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} aria-hidden="true" />
          Post opportunity
        </Link>
      </div>

      {opportunities && opportunities.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {opportunities.map((opp) => {
            const type = opp.opportunity_type as OpportunityType;
            const typeColor = TYPE_COLORS[type] ?? "#5B4FCF";
            const typeLabel = OPPORTUNITY_TYPE_LABELS[type] ?? "Other";
            const owner = Array.isArray(opp.profiles)
              ? opp.profiles[0]
              : opp.profiles;

            return (
              <Link
                key={opp.id}
                href={`/business/${opp.id}`}
                className="bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white mb-2"
                      style={{ backgroundColor: typeColor }}
                    >
                      {typeLabel}
                    </span>
                    <h2 className="font-bold font-nunito text-text leading-tight">
                      {opp.title}
                    </h2>
                    {opp.company_name && (
                      <p className="text-sm text-text-muted mt-0.5">
                        {opp.company_name}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <TrendingUp
                      size={22}
                      style={{ color: typeColor }}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <p className="text-sm text-text-muted line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {opp.is_remote && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-50 text-green-700 text-xs">
                      <Globe size={10} aria-hidden="true" />
                      Remote
                    </span>
                  )}
                  {opp.tags?.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 text-text-muted text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-1 text-xs text-text-light">
                  <span>{owner?.display_name}</span>
                  <span>{formatRelativeTime(opp.created_at)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <TrendingUp
            size={40}
            className="mx-auto mb-3 opacity-30"
            aria-hidden="true"
          />
          <p className="font-medium">No opportunities posted yet</p>
          <p className="text-sm mt-1">
            <Link
              href="/business/new"
              className="text-primary-500 hover:underline"
            >
              Post the first one
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
