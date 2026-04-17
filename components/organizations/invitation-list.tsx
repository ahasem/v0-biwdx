"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  MoreVertical,
  RefreshCw,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { organization } from "@/lib/auth-client";
import { listItem } from "@/lib/animations";

interface Invitation {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
}

interface InvitationListProps {
  organizationId: string;
  invitations: Invitation[];
  onInvitationChanged?: () => void;
}

export function InvitationList({
  organizationId,
  invitations,
  onInvitationChanged,
}: InvitationListProps) {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [invitationToCancel, setInvitationToCancel] = React.useState<Invitation | null>(null);

  const handleResendInvitation = async (invitation: Invitation) => {
    setLoading(invitation.id);
    try {
      // Cancel existing invitation and send a new one
      await organization.cancelInvitation({
        organizationId,
        invitationId: invitation.id,
      });

      const result = await organization.inviteMember({
        organizationId,
        email: invitation.email,
        role: (invitation.role as "admin" | "member") || "member",
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to resend invitation");
      } else {
        toast.success(`Reminder sent to ${invitation.email}`);
        onInvitationChanged?.();
      }
    } catch (error) {
      toast.error("Failed to resend invitation");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    setLoading(invitation.id);
    try {
      const result = await organization.cancelInvitation({
        organizationId,
        invitationId: invitation.id,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to cancel invitation");
      } else {
        toast.success("Invitation cancelled");
        onInvitationChanged?.();
      }
    } catch (error) {
      toast.error("Failed to cancel invitation");
      console.error(error);
    } finally {
      setLoading(null);
      setInvitationToCancel(null);
    }
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  if (pendingInvitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Mail className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No pending invitations</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {pendingInvitations.map((invitation) => {
            const isExpired = new Date(invitation.expiresAt) < new Date();

            return (
              <motion.div
                key={invitation.id}
                variants={listItem}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {isExpired ? (
                        <span className="text-destructive">Expired</span>
                      ) : (
                        <span>
                          Expires{" "}
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={isExpired ? "destructive" : "secondary"}>
                    {isExpired ? "Expired" : invitation.role || "member"}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loading === invitation.id}
                      >
                        {loading === invitation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleResendInvitation(invitation)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setInvitationToCancel(invitation)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AlertDialog
        open={!!invitationToCancel}
        onOpenChange={() => setInvitationToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to{" "}
              {invitationToCancel?.email}? They will no longer be able to join
              the organization with this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                invitationToCancel && handleCancelInvitation(invitationToCancel)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
