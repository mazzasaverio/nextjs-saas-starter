import { z } from "zod";

export const CreateUserProfile = z.object({
  userId: z.string({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a string",
  }),
  description: z.string().optional(),
  interests: z.string().optional(),
  city: z.string().optional(),
});
