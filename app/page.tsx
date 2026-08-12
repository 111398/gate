import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";
import { LandingPage } from "@/views/landing-page";

export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  redirect("/onboarding");
}
