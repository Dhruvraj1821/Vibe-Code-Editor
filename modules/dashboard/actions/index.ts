"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  try {
    const playground = await db.playground.findMany({
      where: { userId: user?.id },
      include: {
        user: true,
        starMarks: {
          where: { userId: user?.id },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return playground;
  } catch (error) {
    console.log("Error in getAllPlaygroundForUser: ", error);
  }
};

export const createPlayground = async ({
  title,
  description,
  template,
}: {
  title: string;
  description?: string;
  template: string;
}) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");

  try {
    const playground = await db.playground.create({
      data: {
        title,
        description,
        template: template as any,
        userId: user.id,
      },
    });
    revalidatePath("/dashboard");
    return playground;
  } catch (error) {
    console.log("Error in createPlayground: ", error);
    throw error;
  }
};

export const deletePlayground = async (id: string) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");

  try {
    await db.playground.delete({
      where: { id, userId: user.id },
    });
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
    });
    if (!original) throw new Error("Playground not found");

    const duplicate = await db.playground.create({
      data: {
        title: `${original.title} (copy)`,
        description: original.description,
        template: original.template,
        userId: user.id,
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
    const existing = await db.starMark.findFirst({
      where: { userId: user.id, playgroundId },
    });

    if (existing) {
      await db.starMark.delete({ where: { id: existing.id } });
    } else {
      await db.starMark.create({
        data: {
          userId: user.id,
          playgroundId,
          isMarked: true,
        },
      });
    }

    revalidatePath("/dashboard");
    return { starred: !existing };
  } catch (error) {
    console.log("Error in toggleStarMark: ", error);
    throw error;
  }
};