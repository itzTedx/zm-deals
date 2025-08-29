"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { IconChevronRight, IconSearch } from "@/assets/icons";

interface SearchFormProps extends React.ComponentProps<"form"> {
  placeholder?: string;
  defaultValue?: string;
}

export function SearchForm({ placeholder = "Search for products...", defaultValue = "", ...props }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set("q", query.trim());
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  return (
    <form {...props} className="flex-1" onSubmit={handleSubmit}>
      <div className="relative mx-auto max-w-sm">
        <Input
          className="peer h-9 ps-9 pe-14 text-sm shadow-lg sm:ps-10 sm:pe-16 sm:text-base"
          id="search"
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          type="search"
          value={query}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <IconSearch className="size-4 sm:size-5" />
        </div>
        <Button
          aria-label="Submit search"
          className="absolute inset-y-0 end-2 my-auto h-6 bg-card shadow-lg sm:end-3 sm:h-7"
          disabled={!query.trim()}
          type="submit"
          variant="outline"
        >
          <IconChevronRight aria-hidden="true" className="size-2.5 sm:size-3" />
        </Button>
      </div>
    </form>
  );
}
