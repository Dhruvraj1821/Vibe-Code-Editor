"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
import { getStarterFiles } from "@/lib/starter-serializer";

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  try {
    const playground = await db.playground.findMany({
      where: { userId: user?.id },
      include: {
        user: true,
        StarMarks: { where: { userId: user?.id } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return playground;
  } catch (error) {
    console.log("Error in getAllPlaygroundForUser: ", error);
  }
};

export const getPlaygroundById = async (id: string) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");
  try {
    return await db.playground.findUnique({ where: { id, userId: user.id } });
  } catch (error) {
    console.log("Error in getPlaygroundById: ", error);
    return null;
  }
};

export const getPlaygroundWithFiles = async (id: string) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");
  try {
    return await db.playground.findUnique({
      where: { id, userId: user.id },
      include: { templateFiles: true },
    });
  } catch (error) {
    console.log("Error in getPlaygroundWithFiles: ", error);
    return null;
  }
};

export const createPlayground = async ({
  title,
  description,
  template,
  useTypeScript,
}: {
  title: string;
  description?: string;
  template: string;
  useTypeScript: boolean;
}) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");
  try {
    const files = getStarterFiles(template, useTypeScript);
    const playground = await db.playground.create({
      data: {
        title,
        description,
        template: template as any,
        userId: user.id,
        templateFiles: { create: { content: files } },
      },
    });
    revalidatePath("/dashboard");
    return playground;
  } catch (error) {
    console.log("Error in createPlayground: ", error);
    throw error;
  }
};

export const updatePlayground = async ({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string;
}) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");
  try {
    const playground = await db.playground.update({
      where: { id, userId: user.id },
      data: { title, description },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/edit/${id}`);
    return playground;
  } catch (error) {
    console.log("Error in updatePlayground: ", error);
    throw error;
  }
};

export const updateTemplateFiles = async (
  playgroundId: string,
  files: Record<string, string>
) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const playground = await db.playground.findUnique({
    where: { id: playgroundId, userId: user.id },
  });
  if (!playground) throw new Error("Playground not found");

  try {
    await db.templateFile.upsert({
      where: { playgroundId },
      update: { content: files },
      create: { playgroundId, content: files },
    });
  } catch (error) {
    console.log("Error in updateTemplateFiles: ", error);
    throw error;
  }
};

export const deletePlayground = async (id: string) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");
  try {
    await db.playground.delete({ where: { id, userId: user.id } });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log("Error in deletePlayground: ", error);
    throw error;
  }
};

export const duplicatePlayground = async (id: string) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");
  try {
    const original = await db.playground.findUnique({
      where: { id, userId: user.id },
      include: { templateFiles: true },
    });
    if (!original) throw new Error("Playground not found");
    const originalFiles = original.templateFiles[0]?.content ?? {};

    const duplicate = await db.playground.create({
      data: {
        title: `${original.title} (copy)`,
        description: original.description,
        template: original.template,
        userId: user.id,
        templateFiles: {
          create: { content: originalFiles },
        },
      },
    });

    revalidatePath("/dashboard");
    return duplicate;
  } catch (error) {
    console.log("Error in duplicatePlayground: ", error);
    throw error;
  }
};

export const toggleStarMark = async (playgroundId: string) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");
  try {
    const existing = await db.starMark.findUnique({
      where: { userId_playgroundId: { userId: user.id, playgroundId } },
    });
    if (existing) {
      await db.starMark.delete({
        where: { userId_playgroundId: { userId: user.id, playgroundId } },
      });
    } else {
      await db.starMark.create({
        data: { userId: user.id, playgroundId, isMarked: true },
      });
    }
    revalidatePath("/dashboard");
    return { starred: !existing };
  } catch (error) {
    console.log("Error in toggleStarMark: ", error);
    throw error;
  }
};