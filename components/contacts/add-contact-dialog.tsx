"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserSync } from "@/hooks/use-user-sync";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddContactDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSource, setLeadSource] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const { user: currentUser } = useUserSync();
  const createContactMutation = useMutation(api.contacts.createContact);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser?._id) {
      toast.error("User not found. Please try again.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createContactMutation({
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string).trim() || undefined,
        company: (formData.get("company") as string).trim() || undefined,
        title: (formData.get("title") as string).trim() || undefined,
        leadSource: leadSource || undefined,
        owner: currentUser._id,
      });

      toast.success("Contact created successfully!");
      formRef.current?.reset();
      setLeadSource("");
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create contact. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      formRef.current?.reset();
      setLeadSource("");
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create a new contact in your CRM
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Smith"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@company.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                placeholder="ACME Corp"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="VP of Sales"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="leadSource">Lead Source</Label>
              <Select
                value={leadSource}
                onValueChange={setLeadSource}
                disabled={isSubmitting}
              >
                <SelectTrigger id="leadSource">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="cold-email">Cold Email</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Contact"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
