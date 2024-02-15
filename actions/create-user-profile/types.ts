import { z } from "zod";
import { UserProfile } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { CreateUserProfile } from "./schema";

export type InputType = z.infer<typeof CreateUserProfile>;
export type ReturnType = ActionState<InputType, UserProfile>;
