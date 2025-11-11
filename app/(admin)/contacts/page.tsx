"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { ContactsFilters } from "@/components/contacts/contacts-filters";
import { AddContactDialog } from "@/components/contacts/add-contact-dialog";
import { ContactDetailSheet } from "@/components/contacts/contact-detail-sheet";
import { Download, Upload, Loader2 } from "lucide-react";

type Contact = {
  _id: Id<"contacts">;
  firstName: string;
  lastName: string;
  email: string;
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

export default function ContactsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const contactsData = useQuery(api.contacts.getContacts, {
    search: globalFilter || undefined,
    sentiment: sentimentFilter || undefined,
    status: statusFilter || undefined,
    limit: 100,
  });

  const contacts = contactsData?.contacts || [];
  const isLoading = contactsData === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your leads and contacts with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Contacts</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to import your contacts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                </div>
                <Button className="w-full">Upload File</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <AddContactDialog />
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <ContactsFilters
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            sentimentFilter={sentimentFilter}
            setSentimentFilter={setSentimentFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <ContactsTable
            contacts={contacts}
            sorting={sorting}
            setSorting={setSorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            onContactSelect={setSelectedContact}
          />
        </CardContent>
      </Card>
      {selectedContact && (
        <ContactDetailSheet
          contact={selectedContact}
          open={!!selectedContact}
          onOpenChange={(open) => !open && setSelectedContact(null)}
        />
      )}
    </div>
  )
}
