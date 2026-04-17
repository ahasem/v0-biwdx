"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
  LogOut,
  MapPin,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { authClient, useSession, multiSession } from "@/lib/auth-client";
import { listItem, staggerContainer, staggerItem } from "@/lib/animations";

interface SessionData {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  token: string;
}

interface DeviceSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
}

export function SessionManager() {
  const { data: currentSession } = useSession();
  const [sessions, setSessions] = React.useState<SessionData[]>([]);
  const [deviceSessions, setDeviceSessions] = React.useState<DeviceSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [revokingAll, setRevokingAll] = React.useState(false);
  const [switchingTo, setSwitchingTo] = React.useState<string | null>(null);

  const fetchSessions = React.useCallback(async () => {
    try {
      // Fetch regular sessions
      const result = await authClient.listSessions();
      if (result?.data) {
        setSessions(result.data as SessionData[]);
      }

      // Fetch multi-session device sessions (multiple accounts on same browser)
      try {
        const deviceResult = await multiSession.listDeviceSessions();
        if (deviceResult?.data) {
          setDeviceSessions(deviceResult.data as DeviceSession[]);
        }
      } catch {
        // Multi-session not available or no device sessions
        setDeviceSessions([]);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Switch to a different account (multi-session)
  const handleSwitchAccount = async (sessionToken: string) => {
    setSwitchingTo(sessionToken);
    try {
      const result = await multiSession.setActive({ sessionToken });
      if (result?.error) {
        toast.error(result.error.message || "Failed to switch account");
      } else {
        toast.success("Switched account successfully");
        // Refresh the page to load new session
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to switch account");
      console.error(error);
    } finally {
      setSwitchingTo(null);
    }
  };

  // Revoke a device session (multi-session)
  const handleRevokeDeviceSession = async (sessionToken: string) => {
    setRevokingId(sessionToken);
    try {
      const result = await multiSession.revoke({ sessionToken });
      if (result?.error) {
        toast.error(result.error.message || "Failed to revoke session");
      } else {
        toast.success("Account removed from device");
        fetchSessions();
      }
    } catch (error) {
      toast.error("Failed to revoke session");
      console.error(error);
    } finally {
      setRevokingId(null);
    }
  };

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return { type: "unknown", name: "Unknown Device" };

    const ua = userAgent.toLowerCase();
    
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return {
        type: "mobile",
        name: ua.includes("iphone") ? "iPhone" : ua.includes("android") ? "Android" : "Mobile",
        icon: Smartphone,
      };
    }
    
    if (ua.includes("ipad") || ua.includes("tablet")) {
      return {
        type: "tablet",
        name: ua.includes("ipad") ? "iPad" : "Tablet",
        icon: Tablet,
      };
    }

    let browser = "Browser";
    if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari")) browser = "Safari";
    else if (ua.includes("edge")) browser = "Edge";

    let os = "";
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";

    return {
      type: "desktop",
      name: `${browser}${os ? ` on ${os}` : ""}`,
      icon: Monitor,
    };
  };

  const handleRevokeSession = async (sessionToken: string) => {
    setRevokingId(sessionToken);
    try {
      const result = await authClient.revokeSession({
        token: sessionToken,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to revoke session");
      } else {
        toast.success("Session revoked successfully");
        fetchSessions();
      }
    } catch (error) {
      toast.error("Failed to revoke session");
      console.error(error);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    setRevokingAll(true);
    try {
      const result = await authClient.revokeSessions();

      if (result?.error) {
        toast.error(result.error.message || "Failed to revoke sessions");
      } else {
        toast.success("All other sessions revoked");
        fetchSessions();
      }
    } catch (error) {
      toast.error("Failed to revoke sessions");
      console.error(error);
    } finally {
      setRevokingAll(false);
    }
  };

  const isCurrentSession = (session: SessionData) => {
    return session.token === currentSession?.session?.token;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Multi-Session: Linked Accounts on This Device */}
      {deviceSessions.length > 1 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linked Accounts</CardTitle>
              <CardDescription>
                Switch between accounts on this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deviceSessions.map((deviceSession) => {
                  const isActive = deviceSession.token === currentSession?.session?.token;
                  return (
                    <motion.div
                      key={deviceSession.token}
                      variants={listItem}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={deviceSession.user.image} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{deviceSession.user.name}</p>
                            {isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {deviceSession.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitchAccount(deviceSession.token)}
                            disabled={switchingTo !== null}
                          >
                            {switchingTo === deviceSession.token ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="mr-2 h-4 w-4" />
                            )}
                            Switch
                          </Button>
                        )}
                        {!isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {deviceSession.user.email} from this device.
                                  You will need to sign in again to use this account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRevokeDeviceSession(deviceSession.token)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Sessions */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </div>
            {sessions.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out of all devices</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all devices except the current one.
                      You will need to sign in again on those devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeAllSessions}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {revokingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign Out All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No active sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {sessions.map((session) => {
                    const device = getDeviceInfo(session.userAgent);
                    const DeviceIcon = device.icon || Globe;
                    const isCurrent = isCurrentSession(session);

                    return (
                      <motion.div
                        key={session.id}
                        variants={listItem}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <DeviceIcon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{device.name}</p>
                              {isCurrent && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {session.ipAddress && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.ipAddress}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(session.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!isCurrent && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will sign out this device. The user will need to
                                  sign in again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRevokeSession(session.token)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {revokingId === session.token && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Revoke
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
