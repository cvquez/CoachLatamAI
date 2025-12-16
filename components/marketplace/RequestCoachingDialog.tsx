"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface RequestCoachingDialogProps {
  coachId: string;
  coachProfileId: string;
  coachName: string;
  trigger: React.ReactNode;
}

const COACHING_AREAS = [
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
  "Other",
];

const BUDGET_RANGES = [
  "Under $50 per session",
  "$50 - $100 per session",
  "$100 - $200 per session",
  "$200 - $300 per session",
  "$300+ per session",
  "Flexible budget",
];

export function RequestCoachingDialog({
  coachId,
  coachProfileId,
  coachName,
  trigger,
}: RequestCoachingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    coaching_area: "",
    message: "",
    preferred_schedule: "",
    budget_range: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.client_name || !formData.client_email || !formData.coaching_area || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const requestData = {
        client_id: user?.id || null,
        coach_id: coachId,
        coach_profile_id: coachProfileId,
        ...formData,
        status: "pending",
      };

      const { error } = await supabase
        .from("coaching_requests")
        .insert(requestData);

      if (error) throw error;

      toast.success(`Your request has been sent to ${coachName}!`);
      setOpen(false);

      setFormData({
        client_name: "",
        client_email: "",
        client_phone: "",
        coaching_area: "",
        message: "",
        preferred_schedule: "",
        budget_range: "",
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Coaching from {coachName}</DialogTitle>
          <DialogDescription>
            Fill out this form to send a coaching request. The coach will review your
            information and get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coaching-area">
              Coaching Area <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.coaching_area}
              onValueChange={(value) => setFormData({ ...formData, coaching_area: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area of interest" />
              </SelectTrigger>
              <SelectContent>
                {COACHING_AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the coach about your goals, challenges, and what you hope to achieve through coaching..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about your goals and expectations
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Preferred Schedule</Label>
            <Input
              id="schedule"
              placeholder="e.g., Weekday evenings, Weekend mornings"
              value={formData.preferred_schedule}
              onChange={(e) => setFormData({ ...formData, preferred_schedule: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range</Label>
            <Select
              value={formData.budget_range}
              onValueChange={(value) => setFormData({ ...formData, budget_range: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your budget range" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
