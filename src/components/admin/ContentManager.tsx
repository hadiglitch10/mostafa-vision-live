import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageContent, useUpdatePageContent } from "@/hooks/usePageContent";
import { usePageSections, useUpdatePageSections, PageSection } from "@/hooks/usePageSections";
import { toast } from "sonner";

// ─── Text Editor ────────────────────────────────────────────────────────────

type ContentField = { key: string; label: string; multiline?: boolean };

const CONTENT_GROUPS: { title: string; fields: ContentField[] }[] = [
  {
    title: "Hero",
    fields: [
      { key: "hero_subtitle", label: "Subtitle (small top text)" },
      { key: "hero_title_line1", label: "Title – Line 1" },
      { key: "hero_title_line2", label: "Title – Line 2" },
      { key: "hero_description", label: "Description", multiline: true },
    ],
  },
  {
    title: "About",
    fields: [
      { key: "about_badge", label: "Badge label" },
      { key: "about_title_line1", label: "Title – Line 1" },
      { key: "about_title_line2", label: "Title – Line 2" },
      { key: "about_bio_1", label: "Bio paragraph 1", multiline: true },
      { key: "about_bio_2", label: "Bio paragraph 2", multiline: true },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "contact_badge", label: "Badge label" },
      { key: "contact_title_line1", label: "Title – Line 1" },
      { key: "contact_title_line2", label: "Title – Line 2" },
      { key: "contact_description", label: "Description", multiline: true },
      { key: "contact_instagram_url", label: "Instagram URL" },
    ],
  },
];

const ContentEditor = () => {
  const { data: content, isLoading } = usePageContent();
  const { mutateAsync: updateContent } = useUpdatePageContent();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (content) setDraft(content);
  }, [content]);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await updateContent({ key, value: draft[key] ?? "" });
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {CONTENT_GROUPS.map((group) => (
        <div key={group.title} className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
            {group.title}
          </h3>
          <div className="space-y-4">
            {group.fields.map(({ key, label, multiline }) => (
              <div key={key} className="space-y-1.5">
                <label htmlFor={`field-${key}`} className="text-xs text-muted-foreground font-medium">{label}</label>
                <div className="flex gap-2 items-start">
                  {multiline ? (
                    <textarea
                      id={`field-${key}`}
                      rows={3}
                      className="flex-1 w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      value={draft[key] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      id={`field-${key}`}
                      type="text"
                      className="flex-1 w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={draft[key] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-9 px-3"
                    onClick={() => handleSave(key)}
                    disabled={saving === key || draft[key] === content?.[key]}
                  >
                    {saving === key ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Section Order ───────────────────────────────────────────────────────────

const SectionOrder = () => {
  const { data: sections, isLoading } = usePageSections();
  const { mutateAsync: updateSections } = useUpdatePageSections();
  const [local, setLocal] = useState<PageSection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sections) setLocal(sections);
  }, [sections]);

  const move = (index: number, direction: -1 | 1) => {
    const next = [...local];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    // Reassign sort_order values
    setLocal(next.map((s, i) => ({ ...s, sort_order: i + 1 })));
  };

  const toggleVisible = (id: string) => {
    setLocal((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSections(local.map((s) => ({ id: s.id, sort_order: s.sort_order, visible: s.visible })));
      toast.success("Section order saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Drag the order of sections shown on the portfolio page. Toggle visibility to show/hide sections.
      </p>

      <div className="space-y-2">
        {local.map((section, index) => (
          <div
            key={section.id}
            className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 ${!section.visible ? "opacity-50" : ""}`}
          >
            {/* Order controls */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === local.length - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Position badge */}
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
              {index + 1}
            </span>

            {/* Section name */}
            <span className="flex-1 text-sm font-medium">{section.label}</span>

            {/* Visibility toggle */}
            <button
              onClick={() => toggleVisible(section.id)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={section.visible ? "Hide section" : "Show section"}
            >
              {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Order
      </Button>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

type ContentTab = "text" | "sections";

const ContentManager = () => {
  const [tab, setTab] = useState<ContentTab>("text");

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border/50 w-full sm:w-fit">
        {(["text", "sections"] as ContentTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t
                ? "bg-card shadow-sm text-foreground border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {t === "text" ? "Edit Text" : "Section Order"}
          </button>
        ))}
      </div>

      {tab === "text" ? <ContentEditor /> : <SectionOrder />}
    </div>
  );
};

export default ContentManager;
