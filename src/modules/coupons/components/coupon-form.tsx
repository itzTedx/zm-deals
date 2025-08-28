"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { InfoTooltip } from "@/components/global/tooltip";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { IconChevronRight, IconCurrency, IconProduct } from "@/assets/icons";

import { cn } from "@/lib/utils";
import type { Coupon } from "@/server/schema";

import { createCoupon, updateCoupon } from "../actions/mutation";
import { CouponFormData, couponFormSchema } from "../schema";

interface CouponFormProps {
  coupon?: Coupon;
  hasCancel?: boolean;
}

export function CouponForm({ coupon, hasCancel = true }: CouponFormProps) {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
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

  function onSubmit(data: CouponFormData) {
    startTransition(async () => {
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
          router.push("/studio/coupons");
        } else {
          // Handle error - you might want to show a toast here
          console.error("Error saving coupon:", result.error);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    });
  }

  return (
    <div className="@container mx-auto flex w-full max-w-5xl flex-col gap-4 pt-4 pb-12">
      <Form {...form}>
        <form className="grid @lg:grid-cols-3 grid-cols-1 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="col-span-full flex @md:flex-row flex-col items-start @md:items-center justify-between @md:gap-0 gap-4">
            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 font-medium @md:text-xl text-gray-600 text-lg leading-none">
                <IconProduct className="size-4 text-gray-500" /> <IconChevronRight className="text-gray-400" />{" "}
                {isEditing ? (coupon?.code ?? "Edit Coupon") : "Create Coupon"}
              </h1>
            </div>
            <div className="flex @md:w-auto w-full justify-end space-x-2">
              {hasCancel && (
                <Button onClick={() => router.push("/studio/coupons")} size="sm" type="button" variant="outline">
                  Cancel
                </Button>
              )}
              <Button disabled={isLoading} size="sm" type="submit">
                <LoadingSwap isLoading={isLoading}>{isEditing ? "Update" : "Create"} Coupon</LoadingSwap>
              </Button>
            </div>
          </div>
          <Card className="@lg:col-span-2 col-span-1">
            <CardContent className="space-y-4">
              <div className="grid @md:grid-cols-2 grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Coupon Code
                        <InfoTooltip
                          info="Unique code that customers will enter to apply the discount."
                          triggerClassName="text-gray-300"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="SUMMER2024" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Discount Type{" "}
                        <InfoTooltip
                          info="Choose between percentage or fixed amount discount."
                          triggerClassName="text-gray-300"
                        />
                      </FormLabel>
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

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid @md:grid-cols-2 grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Discount Value{" "}
                        <span className="text-muted-foreground">
                          {discountType === "percentage" ? "(%)" : <IconCurrency className="size-3.5" />}
                        </span>{" "}
                        <InfoTooltip
                          info={
                            discountType === "percentage"
                              ? "Percentage discount (0-100%)"
                              : "Fixed amount discount in Dhirams"
                          }
                          triggerClassName="text-gray-300"
                        />
                      </FormLabel>
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
                        <FormLabel>
                          Maximum Discount <IconCurrency className="size-3.5 text-muted-foreground" />{" "}
                          <InfoTooltip
                            info="Maximum dollar amount for percentage discounts."
                            triggerClassName="text-gray-300"
                          />
                        </FormLabel>
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

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="grid @md:grid-cols-2 grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="minOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Minimum Order Amount <IconCurrency className="size-3.5" />{" "}
                        <InfoTooltip
                          info="Minimum order total required to use this coupon."
                          triggerClassName="text-gray-300"
                        />
                      </FormLabel>
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

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Usage Limit{" "}
                        <InfoTooltip
                          info="Maximum number of times this coupon can be used."
                          triggerClassName="text-gray-300"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          min="1"
                          placeholder="100"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>

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
                    <FormLabel>
                      Description{" "}
                      <InfoTooltip
                        info="Optional description for internal reference."
                        triggerClassName="text-gray-300"
                      />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        placeholder="Optional description for internal use..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card className="@lg:h-fit h-auto">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex @sm:flex-row flex-col items-start @sm:items-center justify-between @sm:gap-0 gap-4 rounded-lg border p-4">
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
                          autoFocus
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
