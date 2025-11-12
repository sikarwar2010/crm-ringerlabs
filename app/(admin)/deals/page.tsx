"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DealsKanbanBoard } from "@/components/deals/deals-kanban-board";
import { AddDealDialog } from "@/components/deals/add-deal-dialog";
import { DealDetailSheet } from "@/components/deals/deal-detail-sheet";
import { DealsFilters } from "@/components/deals/deals-filters";
import type { DealWithRelations } from "@/components/deals/types";

export default function DealsPage() {
  const [selectedDeal, setSelectedDeal] = useState<DealWithRelations | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");

  const dealsByStage =
    (useQuery(api.deals.getDealsByStage) as
      | Record<string, DealWithRelations[]>
      | undefined) ?? {};
  // const dealsSummary = useQuery(api.deals.getDealsSummary);

  const filteredDealsByStage = useMemo(() => {
    return Object.keys(dealsByStage).reduce<Record<string, DealWithRelations[]>>(
      (acc, stage) => {
        let deals = dealsByStage[stage] || [];

        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase();
          deals = deals.filter((deal) => {
            const nameMatch = deal.name
              .toLowerCase()
              .includes(searchLower);
            const companyMatch =
              deal.company?.name?.toLowerCase().includes(searchLower) ?? false;
            const contactName = `${deal.contact?.firstName || ""} ${deal.contact?.lastName || ""
              }`
              .trim()
              .toLowerCase();
            const contactMatch = contactName
              ? contactName.includes(searchLower)
              : false;
            return nameMatch || companyMatch || contactMatch;
          });
        }

        if (selectedStage && stage !== selectedStage) {
          deals = [];
        }

        if (selectedOwner) {
          deals = deals.filter((deal) => deal.owner === selectedOwner);
        }

        acc[stage] = deals;
        return acc;
      },
      {},
    );
  }, [dealsByStage, searchQuery, selectedStage, selectedOwner]);

  const getTotalValue = () => {
    return Object.values(filteredDealsByStage)
      .flat()
      .reduce((sum, deal) => sum + deal.amount, 0);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Deals</h1>
            <p className="text-muted-foreground">
              Manage your sales pipeline with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <DollarSign className="w-3 h-3 mr-1" />$
              {(getTotalValue() / 1000000).toFixed(1)}M Pipeline
            </Badge>
            <AddDealDialog />
          </div>
        </div>

        {/* Search and Filters */}
        <DealsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          selectedOwner={selectedOwner}
          onOwnerChange={setSelectedOwner}
        />

        {/* Kanban Board */}
        <DealsKanbanBoard
          dealsByStage={filteredDealsByStage}
          onDealClick={setSelectedDeal}
        />
      </div>

      {/* Deal Detail Sheet */}
      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)}
      />
    </>
  );
}
