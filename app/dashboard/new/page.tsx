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
  },
  {
    id: "NEXTJS",
    label: "Next.js",
    description: "Full-stack React framework",
    icon: Lightbulb,
    color: "text-foreground",
    border: "border-border hover:border-border/80",
    bg: "bg-muted/30",
  },
  {
    id: "EXPRESS",
    label: "Express",
    description: "Node.js web server framework",
    icon: Database,
    color: "text-green-500",
    border: "border-green-500/30 hover:border-green-500/60",
    bg: "bg-green-500/5",
  },
  {
    id: "VUE",
    label: "Vue",
    description: "Progressive JavaScript framework",
    icon: Compass,
    color: "text-emerald-500",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-500/5",
  },
  {
    id: "HONO",
    label: "Hono",
    description: "Ultrafast web framework",
    icon: Flame,
    color: "text-orange-500",
    border: "border-orange-500/30 hover:border-orange-500/60",
    bg: "bg-orange-500/5",
  },
  {
    id: "ANGULAR",
    label: "Angular",
    description: "Platform for web applications",
    icon: Terminal,
    color: "text-red-500",
    border: "border-red-500/30 hover:border-red-500/60",
    bg: "bg-red-500/5",
  },
];

interface ConfigOption {
  id: string;
  label: string;
  description: string;
  default: boolean;
}

const templateConfigs: Record<string, ConfigOption[]> = {
  REACT: [
    { id: "typescript", label: "TypeScript", description: "Strongly typed JavaScript", default: true },
    { id: "react-router", label: "React Router", description: "Client-side routing", default: false },
    { id: "tailwind", label: "Tailwind CSS", description: "Utility-first CSS framework", default: true },
    { id: "eslint", label: "ESLint", description: "Code linting and formatting", default: true },
    { id: "vitest", label: "Vitest", description: "Unit testing framework", default: false },
  ],
  NEXTJS: [
    { id: "typescript", label: "TypeScript", description: "Strongly typed JavaScript", default: true },
    { id: "tailwind", label: "Tailwind CSS", description: "Utility-first CSS framework", default: true },
    { id: "eslint", label: "ESLint", description: "Code linting and formatting", default: true },
    { id: "app-router", label: "App Router", description: "Next.js App Router (vs Pages Router)", default: true },
    { id: "prisma", label: "Prisma", description: "Type-safe database ORM", default: false },
    { id: "shadcn", label: "Shadcn/ui", description: "Accessible component library", default: false },
  ],
  EXPRESS: [
    { id: "typescript", label: "TypeScript", description: "Strongly typed JavaScript", default: true },
    { id: "cors", label: "CORS", description: "Cross-origin resource sharing", default: true },
    { id: "helmet", label: "Helmet", description: "HTTP security headers", default: true },
    { id: "prisma", label: "Prisma", description: "Type-safe database ORM", default: false },
    { id: "jwt", label: "JWT Auth", description: "JSON Web Token authentication", default: false },
    { id: "rate-limit", label: "Rate Limiting", description: "Protect against abuse", default: false },
  ],
  VUE: [
    { id: "typescript", label: "TypeScript", description: "Strongly typed JavaScript", default: true },
    { id: "vue-router", label: "Vue Router", description: "Official Vue.js router", default: true },
    { id: "pinia", label: "Pinia", description: "Intuitive state management", default: false },
    { id: "tailwind", label: "Tailwind CSS", description: "Utility-first CSS framework", default: true },
    { id: "eslint", label: "ESLint", description: "Code linting and formatting", default: true },
    { id: "vitest", label: "Vitest", description: "Unit testing framework", default: false },
  ],
  HONO: [
    { id: "typescript", label: "TypeScript", description: "Strongly typed JavaScript", default: true },
    { id: "cors", label: "CORS", description: "Cross-origin resource sharing", default: true },
    { id: "jwt", label: "JWT Auth", description: "JSON Web Token authentication", default: false },
    { id: "zod", label: "Zod Validation", description: "TypeScript-first schema validation", default: true },
    { id: "rate-limit", label: "Rate Limiting", description: "Protect against abuse", default: false },
  ],
  ANGULAR: [
    { id: "strict", label: "Strict Mode", description: "Strict TypeScript & template checks", default: true },
    { id: "routing", label: "Routing", description: "Angular Router module", default: true },
    { id: "material", label: "Angular Material", description: "Material Design components", default: false },
    { id: "eslint", label: "ESLint", description: "Code linting and formatting", default: true },
    { id: "ngrx", label: "NgRx", description: "Reactive state management", default: false },
  ],
};

type ConfigState = Record<string, boolean>;

function buildDefaultConfig(templateId: string): ConfigState {
  return Object.fromEntries(
    (templateConfigs[templateId] ?? []).map((opt) => [opt.id, opt.default])
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("REACT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConfigState>(buildDefaultConfig("REACT"));

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setConfig(buildDefaultConfig(templateId));
  };

  const handleToggle = (optionId: string, value: boolean) => {
    setConfig((prev) => ({ ...prev, [optionId]: value }));
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
      });
      if (result?.id) {
        toast.success("Project created!");
        router.push(`/dashboard/playground/${result.id}`);
      }
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = templateConfigs[selectedTemplate] ?? [];
  const enabledCount = Object.values(config).filter(Boolean).length;

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
        <span className="text-sm font-medium text-foreground">New Project</span>
      </header>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-1">Create a new playground</h1>
          <p className="text-sm text-muted-foreground">
            Choose a template, configure your stack, and give your project a name
          </p>
        </div>

        {/* Project Details */}
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

        {/* Template Config */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Configure Project
            </Label>
            <span className="text-xs text-muted-foreground">
              {enabledCount} of {currentConfig.length} enabled
            </span>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border overflow-hidden">
            {currentConfig.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm font-medium text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                </div>
                <Switch
                  checked={config[option.id] ?? option.default}
                  onCheckedChange={(val) => handleToggle(option.id, val)}
                  className="data-[state=checked]:bg-violet-600 flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
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