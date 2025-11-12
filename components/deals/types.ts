import type { Doc } from "@/convex/_generated/dataModel";

export type DealWithRelations = Doc<"deals"> & {
  company: Doc<"companies"> | null;
  contact: Doc<"contacts"> | null;
};
