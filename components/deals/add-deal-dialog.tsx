"use client";
import { useState } from "react";
import type React from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export function AddDealDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    companyId: "",
    contactId: "",
    closeDate: "",
    type: "new-business",
    leadSource: "",
    nextStep: "",
  });

  const createDeal = useMutation(api.deals.createDeal);
  const companies = useQuery(api.companies.getCompanies, {});
  const contacts = useQuery(api.contacts.getContacts, {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.amount ||
      !formData.companyId ||
      !formData.closeDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createDeal({
        name: formData.name,
        amount: Number.parseFloat(formData.amount),
        companyId: formData.companyId as Id<"companies">,
        contactId: formData.contactId
          ? (formData.contactId as Id<"contacts">)
          : undefined,
        stage: "prospecting",
        probability: 10,
        closeDate: new Date(formData.closeDate).getTime(),
        type: formData.type,
        owner: "Current User", // TODO: Get from auth context
        leadSource: formData.leadSource || undefined,
        nextStep: formData.nextStep || undefined,
      });

      toast.success("Deal created successfully");
      setOpen(false);
      setFormData({
        name: "",
        amount: "",
        companyId: "",
        contactId: "",
        closeDate: "",
        type: "new-business",
        leadSource: "",
        nextStep: "",
      });
    } catch (error) {
      toast.error("Failed to create deal");
      console.error("Error creating deal:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
          <DialogDescription>
            Create a new deal in your pipeline
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="dealName">Deal Name *</Label>
              <Input
                id="dealName"
                placeholder="Enterprise License Renewal"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealAmount">Deal Value *</Label>
              <Input
                id="dealAmount"
                type="number"
                placeholder="250000"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeDate">Expected Close Date *</Label>
              <Input
                id="closeDate"
                type="date"
                value={formData.closeDate}
                onChange={(e) => handleInputChange("closeDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => handleInputChange("companyId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.companies?.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Primary Contact</Label>
              <Select
                value={formData.contactId}
                onValueChange={(value) => handleInputChange("contactId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.contacts?.map((contact) => {
                    const contactName = `${contact.firstName} ${contact.lastName}`.trim();
                    const displayText = contact.company
                      ? `${contactName} @ ${contact.company}`
                      : contactName;
                    return (
                      <SelectItem key={contact._id} value={contact._id}>
                        {displayText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealType">Deal Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-business">New Business</SelectItem>
                  <SelectItem value="expansion">Expansion</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="upsell">Upsell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadSource">Lead Source</Label>
              <Select
                value={formData.leadSource}
                onValueChange={(value) =>
                  handleInputChange("leadSource", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="cold-email">Cold Email</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nextStep">Next Step</Label>
              <Textarea
                id="nextStep"
                placeholder="Schedule discovery call, send proposal, etc."
                value={formData.nextStep}
                onChange={(e) => handleInputChange("nextStep", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Deal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
