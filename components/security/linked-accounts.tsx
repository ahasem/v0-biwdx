"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Loader2, Unlink, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { authClient, signIn } from "@/lib/auth-client";
import { listItem, staggerContainer, staggerItem } from "@/lib/animations";

interface LinkedAccount {
  id: string;
  provider: string;
  accountId: string;
  createdAt: Date;
}

const providerInfo: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  google: {
    name: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    color: "bg-red-500/10 text-red-500",
  },
  facebook: {
    name: "Facebook",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
    ),
    color: "bg-blue-600/10 text-blue-600",
  },
  credential: {
    name: "Email & Password",
    icon: <Link2 className="h-5 w-5" />,
    color: "bg-primary/10 text-primary",
  },
};

export function LinkedAccounts() {
  const [accounts, setAccounts] = React.useState<LinkedAccount[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [unlinkingId, setUnlinkingId] = React.useState<string | null>(null);
  const [linkingProvider, setLinkingProvider] = React.useState<string | null>(null);

  const fetchAccounts = React.useCallback(async () => {
    try {
      const result = await authClient.listAccounts();
      if (result?.data) {
        setAccounts(result.data as LinkedAccount[]);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleLinkAccount = async (provider: "google" | "facebook") => {
    setLinkingProvider(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: window.location.href,
      });
    } catch (error) {
      toast.error(`Failed to link ${provider} account`);
      console.error(error);
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleUnlinkAccount = async (accountId: string) => {
    setUnlinkingId(accountId);
    try {
      const result = await authClient.unlinkAccount({
        accountId,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to unlink account");
      } else {
        toast.success("Account unlinked successfully");
        fetchAccounts();
      }
    } catch (error) {
      toast.error("Failed to unlink account");
      console.error(error);
    } finally {
      setUnlinkingId(null);
    }
  };

  const linkedProviders = accounts.map((a) => a.provider);
  const availableProviders = ["google", "facebook"].filter(
    (p) => !linkedProviders.includes(p)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linked Accounts</CardTitle>
            <CardDescription>
              Manage your connected accounts for signing in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Linked accounts */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {accounts.map((account) => {
                  const info = providerInfo[account.provider] || {
                    name: account.provider,
                    icon: <Link2 className="h-5 w-5" />,
                    color: "bg-muted text-muted-foreground",
                  };

                  return (
                    <motion.div
                      key={account.id}
                      variants={listItem}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${info.color}`}
                        >
                          {info.icon}
                        </div>
                        <div>
                          <p className="font-medium">{info.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Connected{" "}
                            {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {account.provider !== "credential" && accounts.length > 1 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Unlink Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to unlink your {info.name}{" "}
                                account? You will no longer be able to sign in with
                                this account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleUnlinkAccount(account.accountId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {unlinkingId === account.id && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Unlink
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Available providers to link */}
            {availableProviders.length > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Link more accounts
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableProviders.map((provider) => {
                    const info = providerInfo[provider];
                    return (
                      <Button
                        key={provider}
                        variant="outline"
                        onClick={() =>
                          handleLinkAccount(provider as "google" | "facebook")
                        }
                        disabled={linkingProvider !== null}
                      >
                        {linkingProvider === provider ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Link {info.name}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
