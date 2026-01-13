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

// Mapeo de valores en inglés (base de datos) a claves de traducción
const SPECIALIZATIONS_MAP: Record<string, { en: string; es: string }> = {
  "Athernus": { en: "Athernus", es: "Athernus" },
  "Executive Coaching": { en: "Executive Coaching", es: "Coaching Ejecutivo" },
  "Life Coaching": { en: "Life Coaching", es: "Coaching de Vida" },
  "Career Coaching": { en: "Career Coaching", es: "Coaching de Carrera" },
  "Health & Wellness": { en: "Health & Wellness", es: "Salud y Bienestar" },
  "Business Coaching": { en: "Business Coaching", es: "Coaching de Negocios" },
  "Leadership Development": { en: "Leadership Development", es: "Desarrollo de Liderazgo" },
  "Mindfulness": { en: "Mindfulness", es: "Mindfulness" },
  "Relationship Coaching": { en: "Relationship Coaching", es: "Coaching de Relaciones" },
  "Financial Coaching": { en: "Financial Coaching", es: "Coaching Financiero" },
  "Performance Coaching": { en: "Performance Coaching", es: "Coaching de Desempeño" },
};

const LANGUAGES_MAP: Record<string, { en: string; es: string }> = {
  "English": { en: "English", es: "Inglés" },
  "Spanish": { en: "Spanish", es: "Español" },
  "French": { en: "French", es: "Francés" },
  "German": { en: "German", es: "Alemán" },
  "Portuguese": { en: "Portuguese", es: "Portugués" },
  "Italian": { en: "Italian", es: "Italiano" },
  "Mandarin": { en: "Mandarin", es: "Mandarín" },
};

export function SearchFilters({ filters, onFilterChange, onReset }: SearchFiltersProps) {
  const { t, language } = useLanguage();

  const SPECIALIZATIONS = Object.keys(SPECIALIZATIONS_MAP);
  const LANGUAGES = Object.keys(LANGUAGES_MAP);

  const AVAILABILITY_OPTIONS = [
    { value: "available", label: language === 'es' ? 'Disponible Ahora' : 'Available Now' },
    { value: "busy", label: language === 'es' ? 'Disponibilidad Limitada' : 'Limited Availability' },
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

  // Función para obtener la etiqueta traducida
  const getSpecLabel = (spec: string): string => {
    return SPECIALIZATIONS_MAP[spec]?.[language] || spec;
  };

  const getLangLabel = (lang: string): string => {
    return LANGUAGES_MAP[lang]?.[language] || lang;
  };

  return (
    <Card className="sticky top-4 border border-slate-200 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{language === 'es' ? 'Filtros' : 'Filters'}</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              {language === 'es' ? 'Limpiar' : 'Clear'} ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">{language === 'es' ? 'Buscar' : 'Search'}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={language === 'es' ? 'Buscar coaches...' : 'Search coaches...'}
              value={filters.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-3">
          <Label>{language === 'es' ? 'Especializaciones' : 'Specializations'}</Label>
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
                  {getSpecLabel(spec)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-3">
          <Label>{language === 'es' ? 'Calificación Mínima' : 'Minimum Rating'}</Label>
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
              <span>{language === 'es' ? 'Cualquiera' : 'Any'}</span>
              <span className="font-semibold text-foreground">
                {filters.minRating > 0 
                  ? `${filters.minRating}+ ${language === 'es' ? 'estrellas' : 'stars'}` 
                  : (language === 'es' ? 'Cualquier calificación' : 'Any rating')}
              </span>
              <span>5 {language === 'es' ? 'estrellas' : 'stars'}</span>
            </div>
          </div>
        </div>

        {/* Maximum Price */}
        <div className="space-y-3">
          <Label>{language === 'es' ? 'Precio Máximo por Sesión' : 'Maximum Price per Session'}</Label>
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
                {filters.maxPrice < 500 
                  ? `${language === 'es' ? 'Hasta' : 'Up to'} $${filters.maxPrice}` 
                  : (language === 'es' ? 'Cualquier precio' : 'Any price')}
              </span>
              <span>$500+</span>
            </div>
          </div>
        </div>

        {/* Years of Experience */}
        <div className="space-y-3">
          <Label>{language === 'es' ? 'Años de Experiencia' : 'Years of Experience'}</Label>
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
              <span>{language === 'es' ? 'Cualquiera' : 'Any'}</span>
              <span className="font-semibold text-foreground">
                {filters.yearsExperience > 0 
                  ? `${filters.yearsExperience}+ ${language === 'es' ? 'años' : 'years'}` 
                  : (language === 'es' ? 'Cualquier experiencia' : 'Any experience')}
              </span>
              <span>20+ {language === 'es' ? 'años' : 'years'}</span>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>{language === 'es' ? 'Idiomas' : 'Languages'}</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang: string) => (
              <Badge
                key={lang}
                variant={filters.languages.includes(lang) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter("languages", lang)}
              >
                {getLangLabel(lang)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <Label>{language === 'es' ? 'Disponibilidad' : 'Availability'}</Label>
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
              {language === 'es' ? 'Solo Coaches Verificados' : 'Verified Coaches Only'}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
