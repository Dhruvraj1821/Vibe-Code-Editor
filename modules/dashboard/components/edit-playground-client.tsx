"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Zap, Lightbulb, Database, Compass, Flame, Terminal, Code2 } from "lucide-react";
import { updatePlayground } from "@/modules/dashboard/actions";
import { toast } from "sonner";

const templateMeta: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  REACT:   { label: "React",   icon: Zap,      color: "text-cyan-500",    bg: "bg-cyan-500/5",    border: "border-cyan-500/30" },
  NEXTJS:  { label: "Next.js", icon: Lightbulb, color: "text-foreground",  bg: "bg-muted/30",      border: "border-border" },
  EXPRESS: { label: "Express", icon: Database,  color: "text-green-500",   bg: "bg-green-500/5",   border: "border-green-500/30" },
  VUE:     { label: "Vue",     icon: Compass,   color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/30" },
  HONO:    { label: "Hono",    icon: Flame,     color: "text-orange-500",  bg: "bg-orange-500/5",  border: "border-orange-500/30" },
  ANGULAR: { label: "Angular", icon: Terminal,  color: "text-red-500",     bg: "bg-red-500/5",     border: "border-red-500/30" },
};

interface EditPlaygroundClientProps {
  id: string;
  initialTitle: string;
  initialDescription: string;
  template: string;
}

export function EditPlaygroundClient({
  id,
  initialTitle,
  initialDescription,
  template,
}: EditPlaygroundClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const meta = templateMeta[template] ?? { label: template, icon: Code2, color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border" };
  const Icon = meta.icon;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await updatePlayground({ id, title, description });
      toast.success("Project updated");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = title !== initialTitle || description !== initialDescription;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 flex items-center px-4 gap-3">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        </Link>
        <span className="text-sm font-medium text-foreground">Edit Project</span>
      </header>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-1">Edit playground</h1>
          <p className="text-sm text-muted-foreground">Update your project name and description</p>
        </div>

        {/* Template badge — read only */}
        <div className="mb-8">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
            Template
          </Label>
          <div className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-lg border ${meta.bg} ${meta.border} opacity-70 cursor-not-allowed select-none`}>
            <Icon className={`w-4 h-4 ${meta.color}`} />
            <span className="text-sm font-medium text-foreground">{meta.label}</span>
            <span className="text-xs text-muted-foreground ml-1">— cannot be changed</span>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4 mb-8">
          <div className="space-y-1.5">
            <Label
              htmlFor="title"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Project Name
            </Label>
            <Input
              id="title"
              placeholder="my-awesome-project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 bg-muted/40 border-border focus-visible:ring-violet-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Description{" "}
              <span className="normal-case font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What are you building?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none bg-muted/40 border-border focus-visible:ring-violet-500/40 text-sm"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={loading || !title.trim() || !hasChanges}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white h-10"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="h-10 px-6">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}