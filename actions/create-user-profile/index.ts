"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { CreateUserProfile } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = auth();

  if (!userId) {
    return {
      error: "Unauthorized",
    };
  }

  let user_profile;

  try {
    user_profile = await db.userProfile.create({
      data: {
        userId: userId,
        description: data.description,
        interests: data.interests,
        city: data.city,
      },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath(`/home`);
  return { data: user_profile };
};

export const createUserProfile = createSafeAction(CreateUserProfile, handler);
