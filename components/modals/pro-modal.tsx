"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import { stripeRedirect } from "@/actions/stripe-redirect";
import { toast } from "sonner";

export const ProModal = () => {
  const proModal = useProModal();

  const { execute, isLoading } = useAction(stripeRedirect, {
    onSuccess: (data) => {
      window.location.href = data;
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onClick = () => {
    execute({});
  };

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="text-neutral-700 mx-auto space-y-6 p-6">
          <h2 className="font-semibold text-xl">Upgrade to Pro Today!</h2>

          <Button
            disabled={isLoading}
            onClick={onClick}
            className="w-full"
            variant="secondary"
          >
            Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
