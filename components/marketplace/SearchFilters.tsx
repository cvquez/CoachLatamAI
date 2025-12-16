"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface FilterOptions {
  searchQuery: string;
  specializations: string[];
  minRating: number;
  maxPrice: number;
  languages: string[];
  availability: string[];
  yearsExperience: number;
  verifiedOnly: boolean;
}

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const SPECIALIZATIONS = [
  "Executive Coaching",
  "Life Coaching",
  "Career Coaching",
  "Health & Wellness",
  "Business Coaching",
  "Leadership Development",
  "Mindfulness",
  "Relationship Coaching",
  "Financial Coaching",
  "Performance Coaching",
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Mandarin"];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available Now" },
  { value: "busy", label: "Limited Availability" },
];

export function SearchFilters({ filters, onFilterChange, onReset }: SearchFiltersProps) {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: "specializations" | "languages" | "availability", value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const activeFiltersCount =
    filters.specializations.length +
    filters.languages.length +
    filters.availability.length +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxPrice < 500 ? 1 : 0) +
    (filters.yearsExperience > 0 ? 1 : 0);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search coaches..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Specializations</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {SPECIALIZATIONS.map((spec) => (
              <div key={spec} className="flex items-center space-x-2">
                <Checkbox
                  id={`spec-${spec}`}
                  checked={filters.specializations.includes(spec)}
                  onCheckedChange={() => toggleArrayFilter("specializations", spec)}
                />
                <label
                  htmlFor={`spec-${spec}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {spec}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Minimum Rating</Label>
          <div className="space-y-2">
            <Slider
              value={[filters.minRating]}
              onValueChange={([value]) => updateFilter("minRating", value)}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Any</span>
              <span className="font-semibold text-foreground">
                {filters.minRating > 0 ? `${filters.minRating}+ stars` : "Any rating"}
              </span>
              <span>5 stars</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Maximum Price per Session</Label>
          <div className="space-y-2">
            <Slider
              value={[filters.maxPrice]}
              onValueChange={([value]) => updateFilter("maxPrice", value)}
              min={0}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span className="font-semibold text-foreground">
                {filters.maxPrice < 500 ? `Up to $${filters.maxPrice}` : "Any price"}
              </span>
              <span>$500+</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Years of Experience</Label>
          <div className="space-y-2">
            <Slider
              value={[filters.yearsExperience]}
              onValueChange={([value]) => updateFilter("yearsExperience", value)}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Any</span>
              <span className="font-semibold text-foreground">
                {filters.yearsExperience > 0 ? `${filters.yearsExperience}+ years` : "Any experience"}
              </span>
              <span>20+ years</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Languages</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang}
                variant={filters.languages.includes(lang) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter("languages", lang)}
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Availability</Label>
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`avail-${option.value}`}
                  checked={filters.availability.includes(option.value)}
                  onCheckedChange={() => toggleArrayFilter("availability", option.value)}
                />
                <label
                  htmlFor={`avail-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => updateFilter("verifiedOnly", checked)}
            />
            <label
              htmlFor="verified"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Verified Coaches Only
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
