"use client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import type { DealWithRelations } from "./types";

const stages = [
  { id: "prospecting", name: "Prospecting", color: "bg-gray-500" },
  { id: "qualification", name: "Qualification", color: "bg-blue-500" },
  { id: "proposal", name: "Proposal", color: "bg-yellow-500" },
  { id: "negotiation", name: "Negotiation", color: "bg-orange-500" },
  { id: "closed-won", name: "Closed Won", color: "bg-green-500" },
  { id: "closed-lost", name: "Closed Lost", color: "bg-red-500" },
];

interface DealsKanbanBoardProps {
  dealsByStage: Record<string, DealWithRelations[]>;
  onDealClick: (deal: DealWithRelations) => void;
}

export function DealsKanbanBoard({
  dealsByStage,
  onDealClick,
}: DealsKanbanBoardProps) {
  const updateDealStage = useMutation(api.deals.updateDealStage);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    try {
      await updateDealStage({
        id: result.draggableId as Id<"deals">,
        stage: destination.droppableId,
      });
      toast.success("Deal stage updated successfully");
    } catch (error) {
      toast.error("Failed to update deal stage");
      console.error("Error updating deal stage:", error);
    }
  };

  const getDealsByStage = (stageId: string) => {
    return dealsByStage[stageId] || [];
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[600px]">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${stage.color}`} />
              <h3 className="font-semibold text-sm">{stage.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {getDealsByStage(stage.id).length}
              </Badge>
            </div>

            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 space-y-3 p-2 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? "bg-muted/50" : "bg-transparent"
                  }`}
                >
                  {getDealsByStage(stage.id).map((deal, index) => (
                    <Draggable
                      key={deal._id}
                      draggableId={deal._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            snapshot.isDragging ? "rotate-2 shadow-lg" : ""
                          }`}
                          onClick={() => onDealClick(deal)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm line-clamp-2">
                                  {deal.name}
                                </h4>
                                {deal.company?.name && (
                                  <p className="text-xs text-primary hover:underline cursor-pointer">
                                    {deal.company.name}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">
                                  ${(deal.amount / 1000).toFixed(0)}K
                                </span>
                                <div className="flex items-center gap-1">
                                  <Brain className="w-3 h-3 text-primary" />
                                  <span
                                    className={`text-xs font-medium ${
                                      (deal.aiProbability || 0) >= 70
                                        ? "text-green-500"
                                        : (deal.aiProbability || 0) >= 40
                                          ? "text-yellow-500"
                                          : "text-red-500"
                                    }`}
                                  >
                                    {deal.aiProbability || 0}%
                                  </span>
                                </div>
                              </div>

                              {deal.contact && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage
                                      src={`/placeholder-icon.png?height=24&width=24&text=${
                                        deal.contact.firstName?.charAt(0) ??
                                        deal.contact.lastName?.charAt(0) ??
                                        "?"
                                      }`}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {deal.contact.firstName?.charAt(0) ??
                                        deal.contact.lastName?.charAt(0) ??
                                        "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {`${deal.contact.firstName || ""} ${
                                      deal.contact.lastName || ""
                                    }`.trim() || deal.contact.email || "Unnamed contact"}
                                    {deal.company?.name && (
                                      <span className="text-muted-foreground/70 ml-1">
                                        @ {deal.company.name}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground">
                                Close:{" "}
                                {new Date(deal.closeDate).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
