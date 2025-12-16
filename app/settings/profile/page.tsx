"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, X, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

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

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Mandarin", "Japanese"];

const TIMEZONES = [
  "UTC-8 (PST)", "UTC-7 (MST)", "UTC-6 (CST)", "UTC-5 (EST)",
  "UTC-3 (ART)", "UTC+0 (GMT)", "UTC+1 (CET)", "UTC+8 (CST)",
];

export default function CoachProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileId, setProfileId] = useState("");

  const [formData, setFormData] = useState({
    display_name: "",
    tagline: "",
    bio: "",
    avatar_url: "",
    cover_image_url: "",
    specializations: [] as string[],
    languages: [] as string[],
    certifications: [] as string[],
    years_experience: 0,
    session_rate: 0,
    currency: "USD",
    availability_status: "available",
    timezone: "UTC-5 (EST)",
    video_intro_url: "",
    linkedin_url: "",
    website_url: "",
    is_public: true,
  });

  const [newCertification, setNewCertification] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in");
      return;
    }

    const { data, error } = await supabase
      .from("coach_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setHasProfile(true);
      setProfileId(data.id);
      setFormData({
        display_name: data.display_name,
        tagline: data.tagline || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        cover_image_url: data.cover_image_url || "",
        specializations: data.specializations || [],
        languages: data.languages || [],
        certifications: data.certifications || [],
        years_experience: data.years_experience || 0,
        session_rate: data.session_rate || 0,
        currency: data.currency || "USD",
        availability_status: data.availability_status || "available",
        timezone: data.timezone || "UTC-5 (EST)",
        video_intro_url: data.video_intro_url || "",
        linkedin_url: data.linkedin_url || "",
        website_url: data.website_url || "",
        is_public: data.is_public ?? true,
      });
    } else {
      const { data: userData } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", user.id)
        .maybeSingle();

      if (userData) {
        setFormData((prev) => ({
          ...prev,
          display_name: userData.name || "",
        }));
      }
    }

    setIsLoading(false);
  }

  async function handleSave() {
    if (!formData.display_name || !formData.tagline) {
      toast.error("Please fill in your name and tagline");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in");
        return;
      }

      if (hasProfile) {
        const { error } = await supabase
          .from("coach_profiles")
          .update(formData)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Profile updated successfully!");
      } else {
        const { data, error } = await supabase
          .from("coach_profiles")
          .insert({ ...formData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setHasProfile(true);
        setProfileId(data.id);
        toast.success("Profile created successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleSpecialization(spec: string) {
    if (formData.specializations.includes(spec)) {
      setFormData({
        ...formData,
        specializations: formData.specializations.filter((s) => s !== spec),
      });
    } else {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, spec],
      });
    }
  }

  function toggleLanguage(lang: string) {
    if (formData.languages.includes(lang)) {
      setFormData({
        ...formData,
        languages: formData.languages.filter((l) => l !== lang),
      });
    } else {
      setFormData({
        ...formData,
        languages: [...formData.languages, lang],
      });
    }
  }

  function addCertification() {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  }

  function removeCertification(cert: string) {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== cert),
    });
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Marketplace Profile</h1>
            <p className="text-muted-foreground">
              Create your public profile to appear in the marketplace and attract clients
            </p>
          </div>

          {hasProfile && formData.is_public && (
            <Link href={`/marketplace/coaches/${profileId}`} target="_blank">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Public Profile
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              This information will be visible to potential clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline *</Label>
                <Input
                  id="tagline"
                  placeholder="e.g., Executive Coach | Leadership Expert"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell potential clients about your background, experience, and coaching approach..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  placeholder="https://..."
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input
                  id="cover"
                  placeholder="https://..."
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
            <CardDescription>Select all areas where you offer coaching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((spec) => (
                <Badge
                  key={spec}
                  variant={formData.specializations.includes(spec) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSpecialization(spec)}
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) =>
                    setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Session Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.session_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, session_rate: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability Status</Label>
                <Select
                  value={formData.availability_status}
                  onValueChange={(value) => setFormData({ ...formData, availability_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available Now</SelectItem>
                    <SelectItem value="busy">Limited Availability</SelectItem>
                    <SelectItem value="not_accepting">Not Accepting Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Badge
                  key={lang}
                  variant={formData.languages.includes(lang) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certifications & Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a certification..."
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCertification();
                  }
                }}
              />
              <Button type="button" onClick={addCertification} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.certifications.length > 0 && (
              <div className="space-y-2">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{cert}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCertification(cert)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links & Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video">Introduction Video URL (YouTube, Vimeo, etc.)</Label>
              <Input
                id="video"
                placeholder="https://..."
                value={formData.video_intro_url}
                onChange={(e) => setFormData({ ...formData, video_intro_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  placeholder="https://..."
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show profile in marketplace</Label>
                <p className="text-sm text-muted-foreground">
                  Make your profile visible to potential clients
                </p>
              </div>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>

          {hasProfile && formData.is_public && (
            <Link href={`/marketplace/coaches/${profileId}`} target="_blank">
              <Button variant="outline" size="lg" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
