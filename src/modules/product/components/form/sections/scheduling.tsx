import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { formatDate } from "@/lib/functions/format-date";
import { ProductSchema } from "@/modules/product/schema";

export const Scheduling = () => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const form = useFormContext<ProductSchema>();

  return (
    <Card className="h-fit p-0.5">
      <CardHeader className="px-4 pt-1.5 pb-1">
        <CardTitle className="text-sm">Scheduling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Starts on</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <Popover onOpenChange={setOpen} open={open}>
                    <PopoverTrigger asChild>
                      <Button className="w-48 justify-between font-normal" id="date" variant="outline">
                        {field.value ? formatDate(field.value) : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto overflow-hidden p-0">
                      <Calendar
                        captionLayout="dropdown"
                        mode="single"
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpen(false);
                        }}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    defaultValue="10:30:00"
                    id="time-picker"
                    step="1"
                    type="time"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Ends on</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <Popover onOpenChange={setOpen2} open={open2}>
                    <PopoverTrigger asChild>
                      <Button className="w-48 justify-between font-normal" id="date" variant="outline">
                        {field.value ? formatDate(field.value) : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto overflow-hidden p-0">
                      <Calendar
                        captionLayout="dropdown"
                        mode="single"
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpen(false);
                        }}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    defaultValue="10:30:00"
                    id="time-picker"
                    step="1"
                    type="time"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
