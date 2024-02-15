### Next.js SaaS Starter Template

This serves as a template starter and lean for building an effective frontend from which to start building a SaaS with the following features:

#### Features

- Use Next.js, TypeScript, Tailwind and Shadcn
- Authentication with Clerk
- Public landing page and platform wrapped with Clerk and Pro Modals
- Use Prisma with MongoDB for managing subscriptions
- Stripe payment setup with a Settings and Billing page
- Vercel Deployment

#### Set Up Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint
npx shadcn-ui@latest init
```

Add components with Shadcn:

```bash
npx shadcn-ui@latest add button sheet dialog badge separator skeleton
```

Install necessary packages:

```bash
npm install next-themes
npm install zod
npm install stripe
npm install zustand
npm install react-hot-toast
```

### Setting Up Clerk

1. **Add Application**
2. **Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`**
3. **Add `.env` to `.gitignore`**
4. **Install Clerk for Next.js**
   ```bash
   npm install @clerk/nextjs
   ```
5. **Build Your Sign-Up and Sign-In Page**

#### Configure Clerk

Set the following environment variables:

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home`

Now that Clerk is installed and integrated into your application, you can configure which pages are public and which require authentication. We set the provider only for the platform to keep the landing page indexable.

#### Platform Layout Component

Update the `app/(platform)/layout.tsx` file:

```tsx
import { ClerkProvider } from "@clerk/nextjs";

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};

export default PlatformLayout;
```

<!MakeEdit index="0" startLine="57" endLine="58" file="file:///home/sam/github/nextjs-saas-starter/README.md" type="replace" title="Fix ClerkProvider usage" />

#### Middleware Configuration

Go to the middleware and add `publicRoutes: ["/"]`.

#### Installing Prisma for MongoDB

7.  **Install Prisma Client**

    ```bash
    npm install @prisma/client
    ```

8.  **Initialize Prisma with MongoDB**

    ```bash
    prisma init --datasource-provider mongodb
    ```

9.  **Generate a Free Tier Cluster on MongoDB Atlas**

10. **Copy Credentials to `.env` File**

    ```
    DATABASE_URL="mongodb+srv://[username]:[password]@cluster0.hxd9l5u.mongodb.net/[database]"
    ```

    Replace `[username]`, `[password]`, and `[database]` with your actual credentials. Setting `"database"` will create a database with that name within the cluster.

11. **Create `lib/db.ts` File**

    ```tsx
    import { PrismaClient } from "@prisma/client";

    declare global {
      var prisma: PrismaClient | undefined;
    }

    export const db = globalThis.prisma || new PrismaClient();

    if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
    ```

### Stripe Integration

Let's proceed with integrating Stripe into our Next.js SaaS starter project.

First, install the Stripe package:

```bash
npm install stripe
```

Next, navigate to the Stripe website and create a new account. Once you have done that, click on "Developers" to find your API keys. Make sure to note down the secret key and add it to your `.env` file under the variable `STRIPE_API_KEY`.

Now, we'll create a `lib/stripe.ts` file to instantiate the Stripe object with our API key. Ensure that you replace `process.env.STRIPE_API_KEY` with your actual Stripe API key.

Create `lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});
```

---

We will now create a `lib/subscription.ts` file to handle subscription checks.

Create `lib/subscription.ts`:

```typescript
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userSubscription = await db.userSubscription.findUnique({
    where: {
      userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  return !!isValid;
};
```

Add the following function to `lib/utils.ts`:

```typescript
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
```

And add the `NEXT_PUBLIC_APP_URL` variable to your `.env` file.

---

Update the `prisma.schema` file to include a `UserSubscription` model that will store subscription data related to Stripe.

Update the `prisma.schema` file with the following model:

```typescript
model UserSubscription {
  id String @id @default(cuid()) @map(name: "_id")
  userId String @unique
  stripeCustomerId String? @unique @map(name: "stripe_customer_id")
  stripeSubscriptionId String? @unique @map(name: "stripe_subscription_id")
  stripePriceId String? @map(name: "stripe_price_id")
  stripeCurrentPeriodEnd DateTime? @map(name: "stripe_current_period_end")
}
```

After making changes to the Prisma schema, run the following commands to apply the updates:

```bash
npx prisma generate
npx prisma db push
```

### Moving On to Actions

Let's create the `stripe-redirect` directory.

#### Schema Definition

Create `action/stripe-redirect/schema.ts`:

```typescript
import { z } from "zod";

export const StripeRedirect = z.object({});
```

#### Type Definitions

Create `action/stripe-redirect/types.ts`:

```typescript
import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { StripeRedirect } from "./schema";

export type InputType = z.infer<typeof StripeRedirect>;
export type ReturnType = ActionState<InputType, string>;
```

#### Handler Implementation

Create `action/stripe-redirect/index.ts`:

```typescript
"use server";

import { auth, currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { createSafeAction } from "@/lib/create-safe-action";
import { StripeRedirect } from "./schema";
import { InputType, ReturnType } from "./types";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      error: "Unauthorized",
    };
  }

  const settingsUrl = absoluteUrl("/settings");
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
                description: "Unlimited access",
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
```

Please note that the code snippets provided are meant to be placed in the appropriate files within your project structure.

Now, let's create a custom hook `hooks/use-pro-modal.ts` to manage the state of a modal window.

Create `hooks/use-pro-modal.ts`:

```typescript
import { create } from "zustand";

interface useProModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useProModal = create<useProModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
```

<!MakeEdit index="2" startLine="116" endLine="128" file="file:///home/sam/github/nextjs-saas-starter/README.md" type="replace" title="Create useProModal hook" />

Finally, we'll create a corresponding provider for the modal window. This provider will ensure that the modal is only rendered once the component tree is mounted.

Create the `ModalProvider` component:

```jsx
import { useEffect, useState } from "react";
import { ProModal } from "@/components/pro-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <ProModal />
    </>
  );
};
```

In the above code, `@/components/pro-modal` should correspond to the actual location of your `ProModal` component within your project structure.

### Webhook Section

Let's create a webhook in the `api` folder rather than in `actions` because it's something that Stripe needs to call, not us.

```javascript
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse("Webhook error", { status:  400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID is required", { status:  400 });
    }

    await db.userSubscription.create({
      data: {
        userId: session?.metadata?.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end *  1000
        ),
      },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await db.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end *  1000
        ),
      },
    });
  }

  return new NextResponse(null, { status:  200 });
}
```

### Listening to Stripe Events

#### Step 1: Download and Login to Stripe CLI

Download the Stripe Command Line Interface (CLI) and log in with your Stripe account.

```bash
stripe login
```

#### Step 2: Forward Events to Your Webhook

Use the Stripe CLI to forward events to your webhook endpoint.

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

#### Step 3: Trigger Events with the CLI

Trigger specific events using the Stripe CLI to test your webhook.

```bash
stripe trigger payment_intent.succeeded
```

### Creating the Billing Page

Let's proceed with creating the billing page for our SaaS application. This page will allow users to manage their subscriptions and access to the Pro features.

```jsx
import { checkSubscription } from "@/lib/subscription";
import { Separator } from "@/components/ui/separator";
import { SubscriptionButton } from "./_components/subscription-button";
import { Info } from "../_components/info";

const BillingPage = async () => {
  const isPro = await checkSubscription();

  return (
    <div className="w-full">
      <Info isPro={isPro} />
      <Separator className="my-2" />
      <SubscriptionButton isPro={isPro} />
    </div>
  );
};

export default BillingPage;
```

### Enabling the Billing Portal

To provide users with a seamless experience, we should enable the billing portal in the Stripe dashboard. This can be done by navigating to the settings/billing/portal section of the Stripe dashboard.

### Deployment

Before deploying our application, we need to make a few adjustments to our `package.json` file to ensure that Prisma Client is generated during the build process. This is important because Vercel caches dependencies, and we want to avoid using an outdated version of Prisma Client.

Update the `scripts` section in `package.json` to include the `postinstall` command:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate"
}
```

After making these changes, push the updates to GitHub and proceed to deploy on Vercel.

### Connecting Vercel to MongoDB Atlas

To connect Vercel to MongoDB Atlas, follow the instructions provided by MongoDB Atlas for the new integration. This will ensure that your application can securely access the database.

### Generating Prisma Client During Build

It's important to generate Prisma Client during the build process to ensure that the client is always up-to-date with the latest schema changes. This can be done by adding `prisma generate` to the `postinstall` script in your `package.json` file.

If you encounter `prisma: command not found` errors during deployment, ensure that Prisma is included in your standard dependencies, as it is a dev dependency by default.

For more information on deploying Prisma to Vercel, refer to the [Prisma documentation](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel).

### Updating Stripe Webhook for Production

When deploying to production, you'll need to update the Stripe webhook to use the production environment. This involves copying the new webhook URL from your Stripe dashboard and pasting it into the Vercel environment variables. Additionally, you'll need to update the `NEXT_PUBLIC_APP_URL` variable in your `.env` file to reflect the new deployment URL.

After updating the environment variables, redeploy your application on Vercel to apply the changes.

### References and Inspiration

For further inspiration and reference, you can check out the following repositories:

- [AntonioErdeljac/next13-trello](https://github.com/AntonioErdeljac/next13-trello/blob/master/components/modals/pro-modal.tsx)
- [AntonioErdeljac/next13-ai-saas](https://github.com/AntonioErdeljac/next13-ai-saas/blob/master/prisma/schema.prisma)
