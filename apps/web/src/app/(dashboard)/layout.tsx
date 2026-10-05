import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/layout/Topbar";
import SiteFooter from "@/components/layout/SiteFooter";
import type { Profile } from "@spectrumcircle/shared";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (user) {
    await sb
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id);
  }
  const [{ data: profile }, { count: unreadCount }] = user
    ? await Promise.all([
        sb
          .from("profiles")
          .select("id, display_name, avatar_url, role, onboarded_at")
          .eq("id", user.id)
          .single() as Promise<{
          data: Pick<
            Profile,
            "id" | "display_name" | "avatar_url" | "role" | "onboarded_at"
          > | null;
        }>,
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false),
      ])
    : [{ data: null }, { count: 0 }];

  // First-time users who haven't completed onboarding
  if (profile && !profile.onboarded_at) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar profile={profile} unreadCount={unreadCount ?? 0} />
      <main id="main-content" className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
