<script setup>
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
</script>

<template>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">Миандр 10Гц</Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <Tabs default-value="const" class="w-[400px]">
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
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Период</Label>
                  <Input
                    id="width"
                    defaultValue="100n"
                    className="col-span-2 h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth">Скважность</Label>
                  <Input
                    id="maxWidth"
                    defaultValue="50%"
                    className="col-span-2 h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Сдвиг фазы</Label>
                  <Input
                    id="height"
                    defaultValue="33n"
                    className="col-span-2 h-8 w-20"
                  />
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
