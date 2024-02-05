Questa serve come tamplate starter e lean per costruire un frontend efficace da cui partire per costruire il un saas con le seguenti features

# Tag: nextjs,

# Features

- uso nextjs e shadcn
- autenticazione con Clerk
- landing page
- use prisma with mongo db
- stripe payment

# Set project

npx create-next-app@latest . --typescript --tailwind --eslint

npx shadcn-ui@latest init

Aggiungiamo dei componenti con shadcn

npx shadcn-ui@latest add button sheet dialog badge

npm install next-themes

npm install zod

npm install stripe

npm install zustand

npm install react-hot-toast

# Setting clerk

1. Add application
2. Copia NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY e CLERK_SECRET_KEY
3. Aggiungi .env nel .gitignore
4. npm install @clerk/nextjs
5. Build your sign-up and sign-in page

6. Set

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

Now that Clerk is installed and mounted in your application, you can decide which pages are public and which should require authentication to access. Settiamo il provider solo per la platform in modo da lasciare libera la landing page di essere indicizzata

app/(platform)/layout.tsx

import { ClerkProvider } from "@clerk/nextjs";

const PlarformLayout = ({ children }: { children: React.ReactNode }) => {
return <ClerkProvider>{children}</ClerkProvider>;
};

export default PlarformLayout;

Andiamo nel middleware quindi e aggiungiamo publicRoutes: ["/"]

7. Installiamo prisma insieme per connetterlo a mongo sb
   npm install @prisma/client

prisma init --datasource-provider mongodb

Andiamo su mongodb atlas

Generiamo un cluster free tier

Copiamo nel .env le credenziali nel url
DATABASE_URL="mongodb+srv://[username]:[password]@cluster0.hxd9l5u.mongodb.net/[database]"

dove settando "database" andra a creare un database con quel nome all'interno del cluster

Creiamo ora in lib db.ts

import { PrismaClient } from "@prisma/client";

declare global {
var prisma: PrismaClient | undefined;
};

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

## Stripe

Aggiungiamo in prisma.schema:

model UserSubscription {
id String @id @default(cuid()) @map(name: "\_id")
userId String @unique
stripeCustomerId String? @unique @map(name: "stripe_customer_id")
stripeSubscriptionId String? @unique @map(name: "stripe_subscription_id")
stripePriceId String? @map(name: "stripe_price_id")
stripeCurrentPeriodEnd DateTime? @map(name: "stripe_current_period_end")
}

Creaiamo lib/stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
apiVersion: "2023-10-16",
typescript: true,
});

Andiamo su stripe il sito web e facciamo il login

Crea un nuovo account, vai in Developers e copia la STRIPE_API_KEY

Ora creiamo l'hook hooks/use-pro-modal.ts

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

ora creaimo il provider corrispondente

"use client";

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

dove @/components/pro-modal corrispondete a
