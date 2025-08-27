"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import type { Coupon } from "@/server/schema";

import { createCoupon, updateCoupon } from "../actions/mutation";

const couponFormSchema = z
  .object({
    code: z.string().min(1, "Coupon code is required").max(50, "Coupon code too long"),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().positive("Discount value must be positive"),
    minOrderAmount: z.number().optional(),
    maxDiscount: z.number().optional(),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    usageLimit: z.number().int().positive().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.discountType === "percentage" && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type CouponFormData = z.infer<typeof couponFormSchema>;

interface CouponFormProps {
  coupon?: Coupon;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CouponForm({ coupon, onSuccess, onCancel }: CouponFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!coupon;

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || "",
      discountType: coupon?.discountType || "percentage",
      discountValue: coupon?.discountValue ? Number(coupon.discountValue) : 10,
      minOrderAmount: coupon?.minOrderAmount ? Number(coupon.minOrderAmount) : undefined,
      maxDiscount: coupon?.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      startDate: coupon?.startDate || new Date(),
      endDate: coupon?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      usageLimit: coupon?.usageLimit || undefined,
      description: coupon?.description || "",
      isActive: coupon?.isActive ?? true,
    },
  });

  const discountType = form.watch("discountType");

  async function onSubmit(data: CouponFormData) {
    setIsLoading(true);
    try {
      let result;

      if (isEditing) {
        result = await updateCoupon({
          id: coupon.id,
          ...data,
        });
      } else {
        result = await createCoupon(data);
      }

      if (result.success) {
        onSuccess?.();
      } else {
        // Handle error - you might want to show a toast here
        console.error("Error saving coupon:", result.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Coupon" : "Create New Coupon"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the coupon details below." : "Fill in the details to create a new coupon."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input placeholder="SUMMER2024" {...field} />
                    </FormControl>
                    <FormDescription>Unique code that customers will enter to apply the discount.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose between percentage or fixed amount discount.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value {discountType === "percentage" ? "(%)" : "($)"}</FormLabel>
                    <FormControl>
                      <Input
                        max={discountType === "percentage" ? "100" : undefined}
                        min="0"
                        placeholder={discountType === "percentage" ? "10" : "5.00"}
                        step={discountType === "percentage" ? "0.01" : "0.01"}
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      {discountType === "percentage"
                        ? "Percentage discount (0-100%)"
                        : "Fixed amount discount in dollars"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {discountType === "percentage" && (
                <FormField
                  control={form.control}
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Discount ($)</FormLabel>
                      <FormControl>
                        <Input
                          min="0"
                          placeholder="50.00"
                          step="0.01"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription>Maximum dollar amount for percentage discounts.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minOrderAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        min="0"
                        placeholder="25.00"
                        step="0.01"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>Minimum order total required to use this coupon.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input
                        min="1"
                        placeholder="100"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>Maximum number of times this coupon can be used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            variant="outline"
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>When the coupon becomes active.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            variant="outline"
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>When the coupon expires.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Optional description for internal use..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional description for internal reference.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>Enable or disable this coupon.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button onClick={onCancel} type="button" variant="outline">
                  Cancel
                </Button>
              )}
              <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
