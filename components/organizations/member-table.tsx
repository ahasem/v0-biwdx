"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MoreVertical,
  UserMinus,
  Shield,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import { organization, useSession } from "@/lib/auth-client";
import { listItem } from "@/lib/animations";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: Date;
}

interface MemberTableProps {
  organizationId: string;
  members: Member[];
  onMemberRemoved?: () => void;
  onRoleChanged?: () => void;
}

export function MemberTable({
  organizationId,
  members,
  onMemberRemoved,
  onRoleChanged,
}: MemberTableProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = React.useState<Member | null>(null);

  const currentUserId = session?.user?.id;

  const handleRemoveMember = async (member: Member) => {
    setLoading(member.id);
    try {
      const result = await organization.removeMember({
        organizationId,
        memberIdOrEmail: member.userId,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to remove member");
      } else {
        toast.success("Member removed successfully");
        onMemberRemoved?.();
      }
    } catch (error) {
      toast.error("Failed to remove member");
      console.error(error);
    } finally {
      setLoading(null);
      setMemberToRemove(null);
    }
  };

  const handleChangeRole = async (member: Member, newRole: string) => {
    setLoading(member.id);
    try {
      const result = await organization.updateMemberRole({
        organizationId,
        memberIdOrEmail: member.userId,
        role: newRole,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to update role");
      } else {
        toast.success("Role updated successfully");
        onRoleChanged?.();
      }
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            <Crown className="mr-1 h-3 w-3" />
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="default">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Shield className="mr-1 h-3 w-3" />
            Member
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {members.map((member) => (
            <motion.div
              key={member.id}
              variants={listItem}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.user.image || undefined} />
                  <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.user.name || "Unknown"}</p>
                    {member.userId === currentUserId && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {getRoleBadge(member.role)}

                {member.role !== "owner" && member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading === member.id}>
                        {loading === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === "member" && (
                        <DropdownMenuItem
                          onClick={() => handleChangeRole(member, "admin")}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      {member.role === "admin" && (
                        <DropdownMenuItem
                          onClick={() => handleChangeRole(member, "member")}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make Member
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setMemberToRemove(member)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name || "this member"}{" "}
              from the organization? They will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
