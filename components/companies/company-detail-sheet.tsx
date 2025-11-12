"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Globe,
  Phone,
  Users,
  Target,
  Brain,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { EditCompanyDialog } from "./edit-company-dialog";

interface CompanyDetailSheetProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyDetailSheet({
  companyId,
  open,
  onOpenChange,
}: CompanyDetailSheetProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingHealthScore, setIsUpdatingHealthScore] = useState(false);

  const company = useQuery(api.companies.getCompany, {
    id: companyId as Id<"companies">,
  });

  const deleteCompany = useMutation(api.companies.deleteCompany);
  const updateHealthScore = useMutation(api.companies.updateHealthScore);

  const handleDeleteCompany = async () => {
    if (!company) return;

    setIsDeleting(true);
    try {
      await deleteCompany({ id: company._id });
      toast.success("Company deleted successfully");
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete company";
      toast.error(message);
      console.error("Delete company error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateHealthScore = async () => {
    if (!company) return;

    setIsUpdatingHealthScore(true);
    try {
      await updateHealthScore({
        id: company._id,
        dealActivity: 1,
        communicationFrequency: 1,
        paymentHistory: "good",
      });
      toast.success("Health score updated successfully");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update health score";
      toast.error(message);
      console.error("Update health score error:", error);
    } finally {
      setIsUpdatingHealthScore(false);
    }
  };

  if (!company) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl">{company.name}</SheetTitle>
                <SheetDescription>
                  {company.industry || "No industry specified"}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 px-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={
                      company.website.startsWith("http://") ||
                      company.website.startsWith("https://")
                        ? company.website
                        : `https://${company.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{company.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {company.metrics?.contactCount || 0} contacts
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {company.metrics?.activeDeals || 0} active deals
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Owner: {company.owner}
              </div>
              <div className="text-sm text-muted-foreground">
                Type: {company.type}
              </div>
            </CardContent>
          </Card>

          {/* AI Health Score */}
          <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Health Score & Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Account Health</span>
                  <span
                    className={`text-sm font-bold ${(company.healthScore || 50) >= 80
                      ? "text-green-500"
                      : (company.healthScore || 50) >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                      }`}
                  >
                    {company.healthScore || 50}/100
                  </span>
                </div>
                <Progress value={company.healthScore || 50} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Revenue</div>
                  <div className="text-muted-foreground">
                    ${((company.metrics?.totalRevenue || 0) / 1000).toFixed(0)}K
                  </div>
                </div>
                <div>
                  <div className="font-medium">Pipeline Value</div>
                  <div className="text-muted-foreground">
                    ${((company.metrics?.pipelineValue || 0) / 1000).toFixed(0)}
                    K
                  </div>
                </div>
                <div>
                  <div className="font-medium">Won Deals</div>
                  <div className="text-muted-foreground">
                    {company.metrics?.wonDeals || 0}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Active Deals</div>
                  <div className="text-muted-foreground">
                    {company.metrics?.activeDeals || 0}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {(company.healthScore || 50) >= 80
                  ? "Strong relationship with high engagement. Excellent prospects."
                  : (company.healthScore || 50) >= 60
                    ? "Moderate engagement. Consider increasing touchpoints to improve health score."
                    : "Low engagement detected. Immediate attention required to prevent churn."}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateHealthScore}
                disabled={isUpdatingHealthScore}
                className="w-full bg-transparent"
              >
                {isUpdatingHealthScore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Refresh Health Score"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Deals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.deals && company.deals.length > 0 ? (
                company.deals.slice(0, 3).map((deal) => (
                  <div
                    key={deal._id}
                    className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{deal.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {deal.stage}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        ${(deal.amount / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No deals found for this company
                </div>
              )}
              <Button variant="outline" className="w-full bg-transparent">
                View All Deals
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.activities && company.activities.length > 0 ? (
                company.activities.slice(0, 5).map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 p-3 border border-border/50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {activity.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No recent activities
                </div>
              )}
              <Button variant="outline" className="w-full bg-transparent">
                View All Activities
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>

      {/* Edit Company Dialog */}
      <EditCompanyDialog
        companyId={companyId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              company &quot;{company?.name}&quot; and all associated deals and activities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
