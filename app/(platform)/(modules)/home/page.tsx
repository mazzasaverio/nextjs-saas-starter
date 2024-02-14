"use client";

import React from "react";
import { useProModal } from "@/hooks/use-pro-modal";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

function DashBoard() {
  const proModal = useProModal();

  return (
    <div>
      DashBoard{" "}
      <Button onClick={proModal.onOpen} variant="default" className="w-full">
        Upgrade
        <Zap className="w-4 h-4 ml-2 fill-white" />
      </Button>
    </div>
  );
}

export default DashBoard;
