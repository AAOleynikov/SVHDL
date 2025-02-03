<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "radix-vue";
import { Input } from "@/shared/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import {Button} from "@/shared/ui/button";

export type ModalDialogState = {
  isOpened: boolean;
  title: string;
  type: "yesno" | "input";
  callback?: (val: any) => void;
  inputValue?: string;
};

export type DialogParams = {
  title: string;
  text?: string;
  type: "yesno" | "input";
  callback?: (val: any) => void;
  inputValue?: string;
};

const dialogState = defineModel<ModalDialogState>({ required: true });

const clickCallback = () => {
  if (dialogState.value.callback)
    dialogState.value.callback(dialogState.value.inputValue);
};
</script>

<template>
  <DialogRoot v-model:open="dialogState.isOpened">
    <DialogPortal>
      <DialogOverlay class="bg-black opacity-50 fixed inset-0 z-30" />
      <DialogContent
        class="fixed top-[50%] left-[50%] max-h-30 w- max-w-96 translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] z-[100]">
        <DialogTitle class="m-0 text-[17px] font-semibold">
          {{ dialogState.title }}
        </DialogTitle>
        <DialogDescription class="mt-[10px] mb-5 text-[15px] leading-normal">
          <Alert
            v-if="dialogState.type == 'yesno'"
            variant="destructive"
            class="flex flex-row gap-4">
            <i class="bi-x-circle text-4xl"></i>
            <div>
              <AlertTitle>Be careful!</AlertTitle>
              <AlertDescription> This is irreversible </AlertDescription>
            </div>
          </Alert>
        </DialogDescription>

        <Input
          v-if="dialogState.type == 'input'"
          v-model="dialogState.inputValue"
          class="mb-8"
          @keyup.enter="clickCallback" />

        <div class="mt-2 flex justify-end gap-5">
          <DialogClose>
            <Button
              :variant="dialogState.type == 'yesno' ? 'destructive' : ''"
              @click="clickCallback">
              <i class="bi-check-lg font-bold mr-1"></i>Ok
            </Button>
          </DialogClose>
          <DialogClose>
            <Button variant="secondary">
              <i class="bi-x-lg font-bold mr-1"></i>Cancel</Button
            >
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
