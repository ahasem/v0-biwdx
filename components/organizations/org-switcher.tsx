"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Plus,
  Loader2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import {
  useListOrganizations,
  useActiveOrganization,
  organization,
} from "@/lib/auth-client";

export function OrgSwitcher() {
  const router = useRouter();
  const { data: organizations, isPending } = useListOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const [open, setOpen] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);

  const handleSelectOrg = async (orgId: string) => {
    setSwitching(true);
    try {
      await organization.setActive({ organizationId: orgId });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setSwitching(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isPending) {
    return (
      <Button variant="ghost" size="sm" disabled className="hidden sm:flex">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!organizations || organizations.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className="hidden w-[200px] justify-between sm:flex"
        >
          {activeOrg ? (
            <div className="flex items-center gap-2 truncate">
              <Avatar className="h-5 w-5">
                <AvatarImage src={activeOrg.logo || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(activeOrg.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{activeOrg.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Select organization</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleSelectOrg(org.id)}
                  className="cursor-pointer"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src={org.logo || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(org.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{org.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      activeOrg?.id === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  router.push("/organizations/create");
                }}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
