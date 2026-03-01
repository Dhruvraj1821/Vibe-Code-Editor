import { getPlaygroundById } from "@/modules/dashboard/actions";
import { EditPlaygroundClient } from "@/modules/dashboard/components/edit-playground-client";
import { redirect, notFound } from "next/navigation";
import { currentUser } from "@/modules/auth/actions";

interface EditPageProps {
  params: { id: string };
}

export default async function EditPlaygroundPage({ params }: EditPageProps) {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  const playground = await getPlaygroundById(params.id);
  if (!playground) notFound();

  return (
    <EditPlaygroundClient
      id={playground.id}
      initialTitle={playground.title}
      initialDescription={playground.description ?? ""}
      template={playground.template}
    />
  );
}