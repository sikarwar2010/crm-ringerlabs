"use client";
import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface Deal {
  _id: Id<"deals">;
  name: string;
  amount: number;
  stage: string;
  probability: number;
  closeDate: number;
  nextStep?: string;
  companyId?: Id<"companies">;
  contactId?: Id<"contacts">;
}

interface EditDealDialogProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDealDialog({
  deal,
  open,
  onOpenChange,
}: EditDealDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    probability: "",
    closeDate: "",
    stage: "",
    nextStep: "",
  });

  const updateDeal = useMutation(api.deals.updateDeal);

  useEffect(() => {
    if (deal) {
      setFormData({
        name: deal.name,
        amount: deal.amount.toString(),
        probability: deal.probability.toString(),
        closeDate: new Date(deal.closeDate).toISOString().split("T")[0],
        stage: deal.stage,
        nextStep: deal.nextStep || "",
      });
    }
  }, [deal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deal || !formData.name || !formData.amount || !formData.closeDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateDeal({
        id: deal._id,
        name: formData.name,
        amount: Number.parseFloat(formData.amount),
        probability: Number.parseInt(formData.probability),
        closeDate: new Date(formData.closeDate).getTime(),
        stage: formData.stage,
        nextStep: formData.nextStep || undefined,
      });

      toast.success("Deal updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update deal");
      console.error("Error updating deal:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="dealName">Deal Name *</Label>
              <Input
                id="dealName"
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
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) =>
                  handleInputChange("probability", e.target.value)
                }
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
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => handleInputChange("stage", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="qualification">Qualification</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nextStep">Next Step</Label>
              <Textarea
                id="nextStep"
                placeholder="What's the next action for this deal?"
                value={formData.nextStep}
                onChange={(e) => handleInputChange("nextStep", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Deal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
