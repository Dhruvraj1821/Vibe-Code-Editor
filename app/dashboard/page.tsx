import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import { DashboardClient } from "@/modules/dashboard/components/dashboard-client";
import { redirect } from "next/navigation";
import { currentUser } from "@/modules/auth/actions";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  const playgrounds = await getAllPlaygroundForUser();

  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  };

  const formattedData = (playgrounds ?? []).map((p) => ({
    id: p.id,
    name: p.title,
    template: p.template,
    starred: p.StarMarks.length > 0,
    icon: technologyIconMap[p.template] ?? "Code2",
    updatedAt: p.updatedAt,
  }));

  return <DashboardClient initialData={formattedData} />;
}