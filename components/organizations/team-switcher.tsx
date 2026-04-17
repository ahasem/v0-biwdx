"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users, Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";

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

interface Team {
  id: string;
  name: string;
}

interface TeamSwitcherProps {
  organizationId: string;
  teams: Team[];
  currentTeamId?: string;
  onTeamSelect?: (teamId: string) => void;
}

export function TeamSwitcher({
  organizationId,
  teams,
  currentTeamId,
  onTeamSelect,
}: TeamSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const currentTeam = teams.find((t) => t.id === currentTeamId);

  const handleSelectTeam = (teamId: string) => {
    onTeamSelect?.(teamId);
    setOpen(false);
  };

  if (teams.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select team"
          className="w-[180px] justify-between"
        >
          {currentTeam ? (
            <div className="flex items-center gap-2 truncate">
              <Users className="h-4 w-4" />
              <span className="truncate">{currentTeam.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Select team</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup heading="Teams">
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.name}
                  onSelect={() => handleSelectTeam(team.id)}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span className="truncate">{team.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentTeamId === team.id ? "opacity-100" : "opacity-0"
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
                  router.push(`/organizations/${organizationId}/teams/create`);
                }}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
