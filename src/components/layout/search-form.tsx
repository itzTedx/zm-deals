"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { IconChevronRight, IconSearch } from "@/assets/icons";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { LoadingSwap } from "../ui/loading-swap";
import { SearchSuggestions } from "./search-suggestions";

const searchFormSchema = z.object({
  query: z.string().min(1, "Search query is required").optional(),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

interface SearchFormProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  showSuggestions?: boolean;
}

export function SearchForm({
  className = "",
  placeholder = "What are you looking for?",
  defaultValue = "",
  showSuggestions = true,
}: SearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: defaultValue,
    },
  });

  const onSubmit = (data: SearchFormData) => {
    if (data.query?.trim()) {
      startTransition(() => {
        const searchParams = new URLSearchParams();
        searchParams.set("q", data.query?.trim() ?? "");
        router.push(`/search?${searchParams.toString()}`);
      });
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    form.setValue("query", suggestion);
    setShowSuggestionsDropdown(false);

    startTransition(() => {
      const searchParams = new URLSearchParams();
      searchParams.set("q", suggestion);
      router.push(`/search?${searchParams.toString()}`);
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={formRef}>
      <Form {...form}>
        <form className="group relative" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    className="peer h-10 ps-9 pe-14 text-sm hover:placeholder:text-muted-foreground sm:h-11 sm:ps-10 sm:pe-16 sm:text-base"
                    id="search"
                    onChange={(e) => {
                      field.onChange(e);
                      setShowSuggestionsDropdown(true);
                    }}
                    onFocus={() => setShowSuggestionsDropdown(true)}
                    placeholder={placeholder}
                    type="search"
                  />
                </FormControl>
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-300 group-hover:text-muted-foreground/80 group-active:text-muted-foreground/80 peer-disabled:opacity-50">
                  <LoadingSwap isLoading={isPending}>
                    <IconSearch className="size-4 sm:size-5" />
                  </LoadingSwap>
                </div>
                <Button
                  aria-label="Submit search"
                  className="absolute inset-y-0 end-2 my-auto h-6 shadow-lg sm:end-3 sm:h-7"
                  disabled={!field.value?.trim() || isPending}
                  type="submit"
                >
                  <IconChevronRight aria-hidden="true" className="size-2.5 sm:size-3" />
                </Button>
              </FormItem>
            )}
          />
        </form>
      </Form>

      {showSuggestions && (
        <SearchSuggestions
          isVisible={showSuggestionsDropdown}
          onSelectSuggestion={handleSelectSuggestion}
          query={form.watch("query") || ""}
        />
      )}
    </div>
  );
}
