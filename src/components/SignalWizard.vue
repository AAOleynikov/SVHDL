<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { defineModel } from "vue";

const ide_state = defineModel();
</script>

<template>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">Миандр 10Гц</Button>
    </PopoverTrigger>
    <PopoverContent className="">
      <Tabs default-value="const" class="">
        <TabsList>
          <TabsTrigger value="const"> Const </TabsTrigger>
          <TabsTrigger value="miandr"> Миандр </TabsTrigger>
        </TabsList>
        <TabsContent value="const">
          <div class="flex flex-row gap-3 items-center mt-3">
            <Label>NEGATIVE</Label>
            <Switch />
            <Label>POSITIVE</Label>
          </div>
        </TabsContent>
        <TabsContent value="miandr">
          <div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Параметры</h4>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="width">Период</Label>
                  <Input id="width" defaultValue="100n" className="h-8 w-20" />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="maxWidth">Скважность</Label>
                  <Input
                    id="maxWidth"
                    defaultValue="50%"
                    className="h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="height">Сдвиг фазы</Label>
                  <Input id="height" defaultValue="33n" className="h-8 w-20" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PopoverContent>
  </Popover>
</template>

<style scoped></style>
