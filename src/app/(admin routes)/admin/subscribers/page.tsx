"use client";
import React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { subscribersRepository } from "@/lib/api/repositories/subscribers";
import type { Subscriber } from "@/types/subscribers";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // New features state
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [filterVerified, setFilterVerified] = useState<string>("all"); // "all", "true", "false"

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailIsHtml, setEmailIsHtml] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, [page, filterVerified]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      let verified: boolean | undefined = undefined;
      if (filterVerified === "true") verified = true;
      if (filterVerified === "false") verified = false;

      const response = await subscribersRepository.getAll(page, 10, verified);
      setSubscribers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error loading subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await subscribersRepository.delete(id);
      toast.success("Subscriber deleted successfully");
      loadSubscribers();
      // Remove from selection if deleted
      if (selectedSubscribers.has(id)) {
        const newSet = new Set(selectedSubscribers);
        newSet.delete(id);
        setSelectedSubscribers(newSet);
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Failed to delete subscriber");
    }
  };

  const handleToggleVerification = async (id: string) => {
    try {
      await subscribersRepository.toggleVerification(id);
      toast.success("Verification status updated");
      loadSubscribers();
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error("Failed to update verification status");
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await subscribersRepository.export();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscribers.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Export completed");
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast.error("Failed to export subscribers");
    } finally {
      setIsExporting(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all currently visible subscribers
      const allIds = subscribers.map(s => s.id);
      setSelectedSubscribers(new Set(allIds));
    } else {
      setSelectedSubscribers(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedSubscribers);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedSubscribers(newSet);
  };

  // Email handlers
  const handleOpenEmailModal = () => {
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    try {
      setSendingEmail(true);

      const payload = {
        subject: emailSubject,
        message: emailMessage,
        isHtml: emailIsHtml,
        ids: Array.from(selectedSubscribers),
        selectAll: selectedSubscribers.size === 0 && subscribers.length > 0, // If none selected specifically, assume "send to all matched by current filter" or just handle explicitly
        filterVerified: filterVerified !== "all" ? filterVerified : undefined
      };

      // If nothing selected and we want to send to current view's results equivalent
      // The requirement "send mail just like we can in the users one" usually implies:
      // if specific users selected -> send to them
      // if NO users selected -> prompt "Send to ALL?"

      if (selectedSubscribers.size === 0) {
        if (!confirm(`Send email to ALL ${filterVerified === 'all' ? '' : filterVerified + ' '}subscribers?`)) {
          setSendingEmail(false);
          return;
        }
        payload.selectAll = true;
      } else {
        if (!confirm(`Send email to ${selectedSubscribers.size} selected subscribers?`)) {
          setSendingEmail(false);
          return;
        }
        payload.selectAll = false;
      }

      const res = await subscribersRepository.sendEmail(payload);
      toast.success(res.message || "Email process started");

      setShowEmailModal(false);
      setEmailSubject("");
      setEmailMessage("");
      setSelectedSubscribers(new Set());
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <Card className="border-none shadow-none">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Newsletter Subscribers</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your newsletter subscribers and their verification status</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-full"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Verified Filter */}
              <Select value={filterVerified} onValueChange={(val: string) => { setFilterVerified(val); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="true">Verified Only</SelectItem>
                  <SelectItem value="false">Unverified Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Send Email Button */}
              <Button
                onClick={handleOpenEmailModal}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Send Email {selectedSubscribers.size > 0 ? `(${selectedSubscribers.size})` : "(All)"}
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={subscribers.length > 0 && selectedSubscribers.size === subscribers.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900">Email</TableHead>
                  <TableHead className="font-semibold text-slate-900">Source</TableHead>
                  <TableHead className="font-semibold text-slate-900">Date</TableHead>
                  <TableHead className="font-semibold text-slate-900">Verified</TableHead>
                  <TableHead className="font-semibold text-slate-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32">
                      <div className="flex items-center justify-center">
                        <span className="text-gray-500">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="mt-2 text-sm text-gray-500">No subscribers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} className="hover:bg-slate-50">
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedSubscribers.has(subscriber.id)}
                          onChange={(e) => handleSelectOne(subscriber.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell className="text-gray-500">{subscriber.source || "Website"}</TableCell>
                      <TableCell className="text-gray-500">
                        {new Intl.DateTimeFormat('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }).format(new Date(subscriber.createdAt))}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={subscriber.verified}
                          onCheckedChange={() => handleToggleVerification(subscriber.id)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <span className="sr-only">Delete</span>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this subscriber? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(subscriber.id)}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Type your message here..."
                className="h-32"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="html-mode"
                checked={emailIsHtml}
                onCheckedChange={setEmailIsHtml}
              />
              <label htmlFor="html-mode" className="text-sm font-medium">Send as HTML</label>
            </div>
            <div className="text-sm text-gray-500">
              Sending to: <span className="font-semibold text-gray-900">{selectedSubscribers.size > 0 ? `${selectedSubscribers.size} selected` : `All ${filterVerified === 'all' ? '' : filterVerified} subscribers`}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail}>
              {sendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}