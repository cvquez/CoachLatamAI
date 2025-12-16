"use client";

import { useState, useEffect } from "react";
import { CoachCard } from "@/components/marketplace/CoachCard";
import { SearchFilters } from "@/components/marketplace/SearchFilters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { Star, TrendingUp, DollarSign, Users, Sparkles } from "lucide-react";
import Link from "next/link";

interface Coach {
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
}

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

export default function MarketplacePage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    specializations: [],
    minRating: 0,
    maxPrice: 500,
    languages: [],
    availability: [],
    yearsExperience: 0,
    verifiedOnly: false,
  });

  useEffect(() => {
    loadCoaches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [coaches, filters, sortBy]);

  async function loadCoaches() {
    setIsLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("coach_profiles")
      .select("*")
      .eq("is_public", true)
      .order("is_featured", { ascending: false });

    if (error) {
      console.error("Error loading coaches:", error);
    } else {
      setCoaches(data || []);
    }

    setIsLoading(false);
  }

  function applyFilters() {
    let filtered = [...coaches];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (coach) =>
          coach.display_name.toLowerCase().includes(query) ||
          coach.tagline.toLowerCase().includes(query) ||
          coach.specializations.some((spec) => spec.toLowerCase().includes(query))
      );
    }

    if (filters.specializations.length > 0) {
      filtered = filtered.filter((coach) =>
        filters.specializations.some((spec) => coach.specializations.includes(spec))
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter((coach) => coach.average_rating >= filters.minRating);
    }

    if (filters.maxPrice < 500) {
      filtered = filtered.filter((coach) => coach.session_rate <= filters.maxPrice);
    }

    if (filters.languages.length > 0) {
      filtered = filtered.filter((coach) =>
        filters.languages.some((lang) => coach.languages.includes(lang))
      );
    }

    if (filters.availability.length > 0) {
      filtered = filtered.filter((coach) =>
        filters.availability.includes(coach.availability_status)
      );
    }

    if (filters.yearsExperience > 0) {
      filtered = filtered.filter((coach) => coach.years_experience >= filters.yearsExperience);
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter((coach) => coach.is_verified);
    }

    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case "price-low":
        filtered.sort((a, b) => a.session_rate - b.session_rate);
        break;
      case "price-high":
        filtered.sort((a, b) => b.session_rate - a.session_rate);
        break;
      case "experience":
        filtered.sort((a, b) => b.years_experience - a.years_experience);
        break;
      case "reviews":
        filtered.sort((a, b) => b.total_reviews - a.total_reviews);
        break;
      case "featured":
      default:
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return b.average_rating - a.average_rating;
        });
        break;
    }

    setFilteredCoaches(filtered);
  }

  function resetFilters() {
    setFilters({
      searchQuery: "",
      specializations: [],
      minRating: 0,
      maxPrice: 500,
      languages: [],
      availability: [],
      yearsExperience: 0,
      verifiedOnly: false,
    });
  }

  const stats = {
    total: coaches.length,
    available: coaches.filter((c) => c.availability_status === "available").length,
    avgRating: coaches.length > 0
      ? (coaches.reduce((sum, c) => sum + c.average_rating, 0) / coaches.length).toFixed(1)
      : "0",
    avgPrice: coaches.length > 0
      ? Math.round(coaches.reduce((sum, c) => sum + c.session_rate, 0) / coaches.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Coach
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Connect with world-class coaches who will help you achieve your goals
              and unlock your full potential
            </p>

            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-6 w-6" />
                  <span className="text-3xl font-bold">{stats.total}</span>
                </div>
                <p className="text-sm text-blue-100">Expert Coaches</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-3xl font-bold">{stats.available}</span>
                </div>
                <p className="text-sm text-blue-100">Available Now</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-6 w-6 fill-yellow-300 text-yellow-300" />
                  <span className="text-3xl font-bold">{stats.avgRating}</span>
                </div>
                <p className="text-sm text-blue-100">Average Rating</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-3xl font-bold">${stats.avgPrice}</span>
                </div>
                <p className="text-sm text-blue-100">Avg. per Session</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <Link href="/register?type=client">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Started as Client
                </Button>
              </Link>
              <Link href="/register?type=coach">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Become a Coach
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {filteredCoaches.length} Coaches Available
            </h2>
            <p className="text-muted-foreground">
              Browse and connect with expert coaches
            </p>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="experience">Most Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
            />
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredCoaches.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No coaches found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCoaches.map((coach) => (
                  <CoachCard key={coach.id} coach={coach} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
