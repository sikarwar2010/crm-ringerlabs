"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Mail, Phone, Building2, Calendar, Brain, Edit2, Save, X, User } from "lucide-react";
import { toast } from "sonner";

type Contact = {
  _id: Id<"contacts">;
  firstName: string;
  lastName: string;
  email: string;
  notes?: string;
  phone?: string;
  company?: string;
  title?: string;
  owner: string;
  lastActivity?: number;
  sentiment?: "positive" | "neutral" | "negative";
  aiScore?: number;
  leadSource?: string;
  status: string;
  rating: string;
  createdAt: number;
  updatedAt: number;
};

interface ContactDetailSheetProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDetailSheet({
  contact,
  open,
  onOpenChange,
}: ContactDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    status: "",
    rating: "",
    notes: "",
  });

  const contactDetails = useQuery(api.contacts.getContact, { id: contact._id });
  const updateContactMutation = useMutation(api.contacts.updateContact);

  // Initialize form data from contactDetails or contact
  useEffect(() => {
    const source = contactDetails || contact;
    setFormData({
      firstName: source.firstName || "",
      lastName: source.lastName || "",
      email: source.email || "",
      phone: source.phone || "",
      company: source.company || "",
      title: source.title || "",
      status: source.status || "",
      rating: source.rating || "",
      notes: source.notes || "",
    });
    setIsEditing(false);
  }, [contact._id, contactDetails, contact]);

  const fullName = `${formData.firstName} ${formData.lastName}`;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields (First Name, Last Name, Email)");
      return;
    }

    setIsSaving(true);
    try {
      await updateContactMutation({
        id: contact._id,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        title: formData.title.trim() || undefined,
        status: formData.status || undefined,
        rating: formData.rating || undefined,
        notes: formData.notes.trim() || undefined,
      });
      toast.success("Contact updated successfully");
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update contact";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const source = contactDetails || contact;
    setFormData({
      firstName: source.firstName || "",
      lastName: source.lastName || "",
      email: source.email || "",
      phone: source.phone || "",
      company: source.company || "",
      title: source.title || "",
      status: source.status || "",
      rating: source.rating || "",
      notes: source.notes || "",
    });
    setIsEditing(false);
  };

  const currentContact = contactDetails || contact;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[600px] flex flex-col p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="w-14 h-14 shrink-0">
                <AvatarImage
                  src={`/placeholder-icon.png?height=56&width=56&text=${formData.firstName.charAt(0) || "C"}`}
                />
                <AvatarFallback className="text-lg">
                  {formData.firstName.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="First Name"
                        className="flex-1"
                      />
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Last Name"
                        className="flex-1"
                      />
                    </div>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Job Title"
                    />
                  </div>
                ) : (
                  <>
                    <SheetTitle className="text-2xl font-semibold truncate">
                      {fullName}
                    </SheetTitle>
                    <SheetDescription className="mt-1">
                      {formData.title && (
                        <span className="text-base">{formData.title}</span>
                      )}
                      {formData.title && formData.company && " at "}
                      {formData.company && (
                        <span className="text-base font-medium">{formData.company}</span>
                      )}
                    </SheetDescription>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Contact Information */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <a
                          href={`mailto:${formData.email}`}
                          className="text-sm font-medium hover:text-primary transition-colors break-all"
                        >
                          {formData.email}
                        </a>
                      </div>
                    </div>
                    {formData.phone && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">Phone</p>
                            <a
                              href={`tel:${formData.phone}`}
                              className="text-sm font-medium hover:text-primary transition-colors"
                            >
                              {formData.phone}
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                    {formData.company && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">Company</p>
                            <p className="text-sm font-medium">{formData.company}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status & Rating */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Status & Rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange("status", value)}
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="unqualified">Unqualified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Select
                        value={formData.rating}
                        onValueChange={(value) => handleInputChange("rating", value)}
                      >
                        <SelectTrigger id="rating" className="w-full">
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge variant="secondary">{formData.status || "N/A"}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rating</p>
                      <Badge variant="secondary">{formData.rating || "N/A"}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Relationship Summary */}
            <Card className="bg-linear-to-br from-primary/5 via-primary/5 to-primary/10 border-primary/20 border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Relationship Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {fullName} has been highly engaged over the past month with
                  recent interactions. AI analysis shows{" "}
                  <span className="font-medium text-foreground">
                    {currentContact.sentiment || "neutral"}
                  </span>{" "}
                  sentiment and suggests continued engagement.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">
                      AI Score: <span className="text-primary">{currentContact.aiScore || 0}</span>
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${currentContact.sentiment === "positive"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : currentContact.sentiment === "negative"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }`}
                  >
                    {currentContact.sentiment || "neutral"} sentiment
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactDetails?.activities?.length ? (
                  <>
                    {contactDetails.activities.slice(0, 3).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 border border-border/50 rounded-lg hover:border-border transition-colors bg-card"
                      >
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          {activity.type === "call" && (
                            <Phone className="w-5 h-5 text-primary" />
                          )}
                          {activity.type === "email" && (
                            <Mail className="w-5 h-5 text-primary" />
                          )}
                          {activity.type === "meeting" && (
                            <Calendar className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-semibold text-sm">
                              {activity.subject}
                            </span>
                            <Separator orientation="vertical" className="h-3" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2">
                      View Full Timeline
                    </Button>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No recent activities
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add notes about this contact..."
                  className="min-h-[120px] resize-none"
                  disabled={!isEditing}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
