"use client";

import { useAction } from "@/hooks/use-action";

import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";

import { createUserProfile } from "@/actions/create-user-profile";

import React from "react";
import { useProModal } from "@/hooks/use-pro-modal";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

function DashBoard() {
  const proModal = useProModal();

  const userId = "123";

  const { execute, fieldErrors } = useAction(createUserProfile, {
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const description = formData.get("description") as string;

    console.log({ description });
    execute({ userId, description });
  };

  return (
    <div>
      DashBoard{" "}
      <Button onClick={proModal.onOpen} variant="default" className="w-full">
        Upgrade
        <Zap className="w-4 h-4 ml-2 fill-white" />
      </Button>
      <form action={onSubmit}>
        <FormInput
          label="Description"
          id="description"
          type="text"
          errors={fieldErrors}
        />
        <FormSubmit>Save</FormSubmit>
      </form>
    </div>
  );
}

export default DashBoard;
