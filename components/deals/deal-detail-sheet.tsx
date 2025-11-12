"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Target,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Building2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { EditDealDialog } from "./edit-deal-dialog";
import { CompanyDetailSheet } from "@/components/companies/company-detail-sheet";
import type { DealWithRelations } from "./types";

interface DealDetailSheetProps {
  deal: DealWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealDetailSheet({
  deal,
  open,
  onOpenChange,
}: DealDetailSheetProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);

  const dealDetails = useQuery(
    api.deals.getDeal,
    deal ? { id: deal._id } : "skip",
  );
  const deleteDeal = useMutation(api.deals.deleteDeal);

  const handleDelete = async () => {
    if (!deal) return;

    if (
      confirm(
        "Are you sure you want to delete this deal? This action cannot be undone.",
      )
    ) {
      try {
        await deleteDeal({ id: deal._id as Id<"deals"> });
        toast.success("Deal deleted successfully");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to delete deal");
        console.error("Error deleting deal:", error);
      }
    }
  };

  if (!deal) return null;

  const displayDeal = dealDetails || deal;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-xl">
                    {displayDeal.name}
                  </SheetTitle>
                  <SheetDescription>
                    {displayDeal.company?.name && (
                      <button
                        onClick={() => setCompanyDetailOpen(true)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Building2 className="w-3 h-3" />
                        <span className="underline">{displayDeal.company.name}</span>
                      </button>
                    )}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Deal Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Deal Value
                  </span>
                  <span className="font-bold text-lg">
                    ${(displayDeal.amount / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Expected Close
                  </span>
                  <span className="text-sm">
                    {new Date(displayDeal.closeDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stage</span>
                  <Badge variant="secondary">{displayDeal.stage}</Badge>
                </div>
                {displayDeal.contact && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Primary Contact
                    </span>
                    <span className="text-sm">
                      {`${displayDeal.contact.firstName || ""} ${displayDeal.contact.lastName || ""}`.trim() || "Unknown Contact"}
                      {displayDeal.company?.name && (
                        <span className="text-muted-foreground ml-1">
                          @ {displayDeal.company.name}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {displayDeal.company?.name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Company
                    </span>
                    <button
                      onClick={() => setCompanyDetailOpen(true)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Building2 className="w-3 h-3" />
                      {displayDeal.company.name}
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Deal Owner
                  </span>
                  <span className="text-sm">{displayDeal.owner}</span>
                </div>
                {displayDeal.nextStep && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Next Step
                    </span>
                    <p className="text-sm mt-1">{displayDeal.nextStep}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Deal Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Close Probability
                    </span>
                    <span
                      className={`text-sm font-bold ${(displayDeal.aiProbability ||
                        displayDeal.probability) >= 70
                        ? "text-green-500"
                        : (displayDeal.aiProbability ||
                          displayDeal.probability) >= 40
                          ? "text-yellow-500"
                          : "text-red-500"
                        }`}
                    >
                      {displayDeal.aiProbability || displayDeal.probability}%
                    </span>
                  </div>
                  <Progress
                    value={displayDeal.aiProbability || displayDeal.probability}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Recommended Next Steps:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Schedule technical demo with decision makers</li>
                    <li>• Send detailed pricing proposal by end of week</li>
                    <li>• Follow up on security compliance questions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dealDetails?.activities?.length ? (
                  dealDetails.activities.slice(0, 5).map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-start gap-3 p-3 border border-border/50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {activity.subject}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 border border-border/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          Deal Created
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Recently
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        New deal created in the pipeline
                      </p>
                    </div>
                  </div>
                )}
                <Button variant="outline" className="w-full bg-transparent">
                  View Full Timeline
                </Button>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      <EditDealDialog
        deal={displayDeal}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {(() => {
        // Get companyId from dealDetails (which has the full deal with companyId) or from deal
        const dealWithId = dealDetails || deal;
        const companyId =
          (dealWithId as { companyId?: Id<"companies"> })?.companyId ||
          (dealWithId as { company?: { _id?: Id<"companies"> } | null })?.company?._id;
        return companyId ? (
          <CompanyDetailSheet
            companyId={companyId as string}
            open={companyDetailOpen}
            onOpenChange={setCompanyDetailOpen}
          />
        ) : null;
      })()}
    </>
  );
}
