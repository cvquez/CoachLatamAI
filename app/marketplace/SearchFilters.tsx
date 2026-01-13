"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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

const SPECIALIZATIONS_MAP: Record<string, string> = {
  "Athernus": "spec.athernus", // ← NUEVO
  "Executive Coaching": "spec.executive",
  "Life Coaching": "spec.life",
  "Career Coaching": "spec.career",
  "Health & Wellness": "spec.health",
  "Business Coaching": "spec.business",
  "Leadership Development": "spec.leadership",
  "Mindfulness": "spec.mindfulness",
  "Relationship Coaching": "spec.relationship",
  "Financial Coaching": "spec.financial",
  "Performance Coaching": "spec.performance",
};

const LANGUAGES_MAP: Record<string, string> = {
  "English": "lang.english",
  "Spanish": "lang.spanish",
  "French": "lang.french",
  "German": "lang.german",
  "Portuguese": "lang.portuguese",
  "Italian": "lang.italian",
  "Mandarin": "lang.mandarin",
};

export function SearchFilters({ filters, onFilterChange, onReset }: SearchFiltersProps) {
  const { t } = useLanguage();

  const SPECIALIZATIONS = Object.keys(SPECIALIZATIONS_MAP);
  const LANGUAGES = Object.keys(LANGUAGES_MAP);

  const AVAILABILITY_OPTIONS = [
    { value: "available", label: t('filters.available_now') },
    { value: "busy", label: t('filters.limited_availability') },
  ];

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
          <CardTitle className="text-lg">{t('filters.title')}</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              {t('filters.clear')} ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">{t('filters.search')}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('filters.search_placeholder')}
              value={filters.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-3">
          <Label>{t('filters.specializations')}</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {SPECIALIZATIONS.map((spec: string) => (
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
                  {t(SPECIALIZATIONS_MAP[spec])}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-3">
          <Label>{t('filters.minimum_rating')}</Label>
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
              <span>{t('filters.any')}</span>
              <span className="font-semibold text-foreground">
                {filters.minRating > 0 ? `${filters.minRating}+ ${t('filters.stars')}` : t('filters.any_rating')}
              </span>
              <span>5 {t('filters.stars')}</span>
            </div>
          </div>
        </div>

        {/* Maximum Price */}
        <div className="space-y-3">
          <Label>{t('filters.maximum_price')}</Label>
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
                {filters.maxPrice < 500 ? `${t('filters.up_to')} $${filters.maxPrice}` : t('filters.any_price')}
              </span>
              <span>$500+</span>
            </div>
          </div>
        </div>

        {/* Years of Experience */}
        <div className="space-y-3">
          <Label>{t('filters.years_experience')}</Label>
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
              <span>{t('filters.any')}</span>
              <span className="font-semibold text-foreground">
                {filters.yearsExperience > 0 ? `${filters.yearsExperience}+ ${t('filters.years')}` : t('filters.any_experience')}
              </span>
              <span>20+ {t('filters.years')}</span>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>{t('filters.languages')}</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang: string) => (
              <Badge
                key={lang}
                variant={filters.languages.includes(lang) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter("languages", lang)}
              >
                {t(LANGUAGES_MAP[lang])}
              </Badge>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <Label>{t('filters.availability')}</Label>
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

        {/* Verified Only */}
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
              {t('filters.verified_only')}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
