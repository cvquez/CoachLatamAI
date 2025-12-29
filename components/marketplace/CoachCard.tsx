"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, DollarSign, CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CoachCardProps {
  coach: {
    id: string;
    user_id: string;
    display_name: string;
    tagline: string;
    avatar_url: string;
    specializations: string[];
    languages: string[];
    years_experience: number;
    session_rate: number;
    currency: string;
    average_rating: number;
    total_reviews: number;
    is_verified: boolean;
    is_featured: boolean;
    availability_status: string;
    timezone: string;
  };
}

export function CoachCard({ coach }: CoachCardProps) {
  const { t } = useLanguage();
  
  const initials = coach.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const availabilityColors = {
    available: "bg-green-100 text-green-800 border-green-200",
    busy: "bg-amber-100 text-amber-800 border-amber-200",
    not_accepting: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const getAvailabilityLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: t('availability.available'),
      busy: t('availability.busy'),
      not_accepting: t('availability.not_accepting'),
    };
    return labels[status] || status;
  };

  const translateLanguage = (lang: string) => {
    const langMap: Record<string, string> = {
      'English': t('lang.english'),
      'Spanish': t('lang.spanish'),
      'Español': t('lang.spanish'),
      'French': t('lang.french'),
      'German': t('lang.german'),
      'Portuguese': t('lang.portuguese'),
      'Italian': t('lang.italian'),
      'Mandarin': t('lang.mandarin'),
    };
    return langMap[lang] || lang;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {coach.is_featured && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold py-1 px-3 text-center">
          {t('coach.featured')}
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-slate-200">
            <AvatarImage src={coach.avatar_url} alt={coach.display_name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                  {coach.display_name}
                  {coach.is_verified && (
                    <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {coach.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {coach.average_rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{coach.average_rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({coach.total_reviews})
                  </span>
                </div>
              )}

              {coach.years_experience > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-muted-foreground">
                    {coach.years_experience}+ {t('coach.years')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          {coach.specializations.slice(0, 3).map((spec, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {spec}
            </Badge>
          ))}
          {coach.specializations.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{coach.specializations.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="text-xs">{coach.timezone}</span>
          </div>

          {coach.languages.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs">
                {coach.languages.map(lang => translateLanguage(lang)).join(", ")}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Badge
            variant="outline"
            className={availabilityColors[coach.availability_status as keyof typeof availabilityColors]}
          >
            <Calendar className="h-3 w-3 mr-1" />
            {getAvailabilityLabel(coach.availability_status)}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-baseline gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-xl font-bold">{coach.session_rate}</span>
          <span className="text-sm text-muted-foreground">/{coach.currency} {t('coach.per_session')}</span>
        </div>

        <Link href={`/marketplace/coaches/${coach.id}`}>
          <Button size="sm" className="gap-2">
            {t('coach.view_profile')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
