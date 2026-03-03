"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal, Trash2, Copy, ExternalLink, Link2, Star, StarOff, Pencil
} from "lucide-react";
import { deletePlayground, duplicatePlayground, toggleStarMark } from "@/modules/dashboard/actions";
import { toast } from "sonner";

interface PlaygroundRowActionsProps {
  id: string;
  name: string;
  starred: boolean;
  onStarToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function PlaygroundRowActions({
  id,
  name,
  starred,
  onStarToggle,
  onDelete,
  onDuplicate,
}: PlaygroundRowActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePlayground(id);
      onDelete(id);
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error("Failed to delete playground");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      await duplicatePlayground(id);
      onDuplicate(id);
      toast.success(`"${name}" duplicated`);
      router.refresh();
    } catch {
      toast.error("Failed to duplicate playground");
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async () => {
    try {
      await toggleStarMark(id);
      onStarToggle(id);
      toast.success(starred ? `"${name}" unstarred` : `"${name}" starred`);
    } catch {
      toast.error("Failed to update star");
    }
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/playground/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleOpenInNewTab = () => {
    window.open(`/playground/${id}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={loading}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleStarToggle} className="gap-2 cursor-pointer">
          {starred ? (
            <><StarOff className="w-3.5 h-3.5" /> Unstar</>
          ) : (
            <><Star className="w-3.5 h-3.5" /> Star</>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/edit/${id}`)}
          className="gap-2 cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate} className="gap-2 cursor-pointer">
          <Copy className="w-3.5 h-3.5" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyUrl} className="gap-2 cursor-pointer">
          <Link2 className="w-3.5 h-3.5" />
          Copy URL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenInNewTab} className="gap-2 cursor-pointer">
          <ExternalLink className="w-3.5 h-3.5" />
          Open in new tab
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}