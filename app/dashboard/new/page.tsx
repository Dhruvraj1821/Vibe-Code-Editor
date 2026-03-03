"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Zap, Lightbulb, Database, Compass, Flame, Terminal } from "lucide-react";
import { createPlayground } from "@/modules/dashboard/actions";
import { toast } from "sonner";

const templates = [
  {
    id: "REACT",
    label: "React",
    description: "Build UI components with React",
    icon: Zap,
    color: "text-cyan-500",
    border: "border-cyan-500/30 hover:border-cyan-500/60",
    bg: "bg-cyan-500/5",
    supportsTs: true,
  },
  {
    id: "NEXTJS",
    label: "Next.js",
    description: "Full-stack React framework",
    icon: Lightbulb,
    color: "text-foreground",
    border: "border-border hover:border-border/80",
    bg: "bg-muted/30",
    supportsTs: false,
  },
  {
    id: "EXPRESS",
    label: "Express",
    description: "Node.js web server framework",
    icon: Database,
    color: "text-green-500",
    border: "border-green-500/30 hover:border-green-500/60",
    bg: "bg-green-500/5",
    supportsTs: false,
  },
  {
    id: "VUE",
    label: "Vue",
    description: "Progressive JavaScript framework",
    icon: Compass,
    color: "text-emerald-500",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-500/5",
    supportsTs: false,
  },
  {
    id: "HONO",
    label: "Hono",
    description: "Ultrafast web framework",
    icon: Flame,
    color: "text-orange-500",
    border: "border-orange-500/30 hover:border-orange-500/60",
    bg: "bg-orange-500/5",
    supportsTs: false,
  },
  {
    id: "ANGULAR",
    label: "Angular",
    description: "Platform for web applications",
    icon: Terminal,
    color: "text-red-500",
    border: "border-red-500/30 hover:border-red-500/60",
    bg: "bg-red-500/5",
    supportsTs: false,
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("REACT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useTypeScript, setUseTypeScript] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedMeta = templates.find((t) => t.id === selectedTemplate);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const meta = templates.find((t) => t.id === templateId);
    if (!meta?.supportsTs) setUseTypeScript(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    setLoading(true);
    try {
      const result = await createPlayground({
        title,
        description,
        template: selectedTemplate,
        useTypeScript,
      });
      if (result?.id) {
        toast.success("Project created!");
        router.push(`playground/${result.id}`);
      }
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 flex items-center px-4 gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        </Link>
        <span className="text-sm font-medium text-foreground">New Project</span>
      </header>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-1">Create a new playground</h1>
          <p className="text-sm text-muted-foreground">Choose a template and give your project a name</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description <span className="normal-case font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What are you building?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none bg-muted/40 border-border focus-visible:ring-violet-500/40 text-sm"
              rows={2}
            />
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-8">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
            Template
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {templates.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id)}
                  className={`relative text-left p-4 rounded-lg border transition-all duration-150 ${t.bg} ${t.border} ${
                    isSelected ? "ring-2 ring-violet-500/50 border-violet-500/50" : ""
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${t.color}`} />
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TypeScript toggle — only shown for REACT */}
        {selectedMeta?.supportsTs && (
          <div className="mb-8">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
              Options
            </Label>
            <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">TypeScript</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Use the TypeScript variant of this template
                  </p>
                </div>
                <Switch
                  checked={useTypeScript}
                  onCheckedChange={setUseTypeScript}
                  className="data-[state=checked]:bg-violet-600 shrink-0"
                />
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10"
        >
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </div>
  );
}