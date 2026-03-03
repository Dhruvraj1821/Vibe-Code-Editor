import { redirect, notFound } from "next/navigation";
import { currentUser } from "@/modules/auth/actions";
import { getPlaygroundWithFiles } from "@/modules/dashboard/actions";
import { EditorLayout } from "@/modules/playground/components/editor-layout";

interface PlaygroundPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { id } = await params;

  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  const playground = await getPlaygroundWithFiles(id);
  if (!playground) notFound();

  const files = (playground.templateFiles?.[0]?.content ?? {}) as Record<string, string>;

  return (
    <EditorLayout
      playgroundId={id}
      projectName={playground.title}
      files={files}
    />
  );
}