"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { IconChevronRight, IconSearch } from "@/assets/icons";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SearchSuggestions } from "./search-suggestions";

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
  const [query, setQuery] = useState(defaultValue);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set("q", query.trim());
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestionsDropdown(false);

    const searchParams = new URLSearchParams();
    searchParams.set("q", suggestion);
    router.push(`/search?${searchParams.toString()}`);
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
      <form className="group relative" onSubmit={handleSubmit}>
        <Input
          autoComplete="off"
          className="peer h-10 ps-9 pe-14 text-sm hover:placeholder:text-muted-foreground sm:h-11 sm:ps-10 sm:pe-16 sm:text-base"
          id="search"
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestionsDropdown(true);
          }}
          onFocus={() => setShowSuggestionsDropdown(true)}
          placeholder={placeholder}
          type="search"
          value={query}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-300 group-hover:text-muted-foreground/80 group-active:text-muted-foreground/80 peer-disabled:opacity-50">
          <IconSearch className="size-4 sm:size-5" />
        </div>
        <Button
          aria-label="Submit search"
          className="absolute inset-y-0 end-2 my-auto h-6 shadow-lg sm:end-3 sm:h-7"
          disabled={!query.trim()}
          type="submit"
        >
          <IconChevronRight aria-hidden="true" className="size-2.5 sm:size-3" />
        </Button>
      </form>

      {showSuggestions && (
        <SearchSuggestions
          isVisible={showSuggestionsDropdown}
          onSelectSuggestion={handleSelectSuggestion}
          query={query}
        />
      )}
    </div>
  );
}
