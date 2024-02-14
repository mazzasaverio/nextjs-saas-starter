"use server";

import { auth, currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

import { createSafeAction } from "@/lib/create-safe-action";

import { StripeRedirect } from "./schema";
import { InputType, ReturnType } from "./types";

import { absoluteUrl } from "@/lib/utils";
import { stripe } from "@/lib/stripe";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      error: "Unauthorized",
    };
  }

  const settingsUrl = absoluteUrl(`/settings`);

  let url = "";

  try {
    const userSubscription = await db.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      url = stripeSession.url;
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.emailAddresses[0].emailAddress,
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "Pro",
                description: "Unlimited Access to Pro Features",
              },
              unit_amount: 2000,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
        },
      });

      url = stripeSession.url || "";
    }
  } catch {
    return {
      error: "Something went wrong!",
    };
  }

  revalidatePath(`/settings`);
  return { data: url };
};

export const stripeRedirect = createSafeAction(StripeRedirect, handler);
