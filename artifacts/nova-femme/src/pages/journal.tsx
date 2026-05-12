import { useState } from "react";
import {
  useListJournalEntries,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  getListJournalEntriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

const SOUL_EMOJIS = ["✨", "🕯️", "🖋️", "🌿", "🌊", "🧘‍♀️", "🐚", "🕊️", "🪐", "❤️"];

const DEFAULT_EMOJI = "✨";

function EmojiPicker({
  value,
  onChange,
  testIdPrefix,
}: {
  value: string;
  onChange: (e: string) => void;
  testIdPrefix: string;
}) {
  return (
    <div
      className="flex flex-wrap gap-2 p-3 rounded-xl"
      style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)" }}
      data-testid={`${testIdPrefix}-emoji-picker`}
    >
      {SOUL_EMOJIS.map(emoji => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className="text-2xl hover:scale-125 transition-transform rounded-lg py-1 px-1.5"
          style={
            value === emoji
              ? { background: "rgba(212,175,55,0.15)", outline: "2px solid rgba(212,175,55,0.6)" }
              : {}
          }
          data-testid={`${testIdPrefix}-emoji-${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default function JournalPage() {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useListJournalEntries();
  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [titleTouched, setTitleTouched] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editEmoji, setEditEmoji] = useState(DEFAULT_EMOJI);

  const handleCreate = () => {
    if (!title.trim()) { setTitleTouched(true); return; }
    if (!content.trim()) return;
    createEntry.mutate(
      { data: { title: title.trim(), content: content.trim(), mood: emoji } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });
          setTitle("");
          setContent("");
          setEmoji(DEFAULT_EMOJI);
          setTitleTouched(false);
          setShowForm(false);
        },
      }
    );
  };

  const startEdit = (entry: { id: number; title: string; content: string; mood?: string | null }) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditEmoji(entry.mood || DEFAULT_EMOJI);
  };

  const handleUpdate = (id: number) => {
    updateEntry.mutate(
      { id, data: { title: editTitle.trim(), content: editContent.trim(), mood: editEmoji } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });
          setEditingId(null);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteEntry.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() }) }
    );
  };

  return (
    <Layout>
      <div className="space-y-8 page-section">

        {/* Heading */}
        <div className="space-y-2 fade-up" style={{ animationDelay: "0ms" }}>
          <h1 className="text-4xl font-serif font-semibold text-primary flex items-center gap-3" data-testid="heading-journal">
            <span className="journal-icon-glow">❧</span>
            Zapiski Duszy
          </h1>
          <p className="text-muted-foreground font-sans text-sm italic pl-11">
            Przestrzeń na Twoje najgłębsze myśli i refleksje
          </p>
        </div>

        {/* Inspirational phrase */}
        <div className="fade-up flex items-center gap-3" style={{ animationDelay: "40ms" }}>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.35))" }} />
          <p className="font-serif italic text-sm text-center" style={{ color: "#C9952A", opacity: 0.85 }}>
            Pozwól swoim myślom płynąć jak rzeka...
          </p>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(212,175,55,0.35))" }} />
        </div>

        {/* Add button */}
        <div className="fade-up" style={{ animationDelay: "80ms" }}>
          <button
            onClick={() => { setShowForm(s => !s); setTitleTouched(false); }}
            className="btn-gold-outline"
            data-testid="button-add-entry"
          >
            <Plus className="w-4 h-4" />
            <span className="font-serif italic">Nowy zapisek</span>
          </button>
        </div>

        {/* New entry form — luxe parchment */}
        {showForm && (
          <div className="parchment-card space-y-4 fade-up" data-testid="form-new-entry">
            <div className="text-center mb-2">
              <span style={{ color: "#D4AF37", fontSize: "0.65rem", letterSpacing: "0.45em", opacity: 0.65 }}>✦ · NOWA STRONA · ✦</span>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                placeholder="Nadaj imię swojej refleksji..."
                value={title}
                onChange={e => { setTitle(e.target.value); if (e.target.value.trim()) setTitleTouched(false); }}
                className="parchment-input font-serif text-lg"
                style={{ fontSize: "1.1rem", borderColor: titleTouched && !title.trim() ? "rgba(180,120,40,0.7)" : undefined }}
                data-testid="input-entry-title"
              />
              {titleTouched && !title.trim() && (
                <p className="text-xs font-serif italic px-1" style={{ color: "#C9952A" }}>
                  Każda myśl zasługuje na swoje imię. Proszę, dodaj tytuł.
                </p>
              )}
            </div>

            {/* Emoji mood picker — between title and content */}
            <div className="space-y-1.5">
              <label className="parchment-label flex items-center gap-2">
                <span>Nastrój duszy</span>
                <span className="text-xl">{emoji}</span>
              </label>
              <EmojiPicker value={emoji} onChange={setEmoji} testIdPrefix="new-entry" />
            </div>

            <textarea
              placeholder="Co niesie ze sobą ta chwila? Co czujesz? Co chcesz sobie powiedzieć?"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="parchment-textarea"
              data-testid="textarea-entry-content"
            />

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleCreate}
                disabled={!title.trim() || !content.trim() || createEntry.isPending}
                className="btn-burgundy"
                data-testid="button-save-entry"
              >
                {createEntry.isPending ? "Zapisuję..." : "Zapisz"}
              </button>
              <button
                onClick={() => { setShowForm(false); setTitleTouched(false); }}
                className="btn-ghost"
                data-testid="button-cancel-entry"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Entries list */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-serif italic">Ładowanie zapisków...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 space-y-3 fade-up" data-testid="empty-journal">
            <p className="text-4xl">📖</p>
            <p className="font-serif text-muted-foreground italic">Twój dziennik czeka na pierwsze słowa.</p>
            <p className="text-sm font-sans text-muted-foreground">Pisanie to akt miłości wobec siebie.</p>
          </div>
        ) : (
          <div className="space-y-5" data-testid="list-journal-entries">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="journal-card group fade-up"
                style={{ animationDelay: `${140 + i * 65}ms` }}
                data-testid={`card-journal-${entry.id}`}
              >
                {editingId === entry.id ? (
                  /* ── Edit mode — paper feel ── */
                  <div className="space-y-3">
                    <div className="text-center mb-1">
                      <span style={{ color: "#D4AF37", fontSize: "0.6rem", letterSpacing: "0.4em", opacity: 0.6 }}>✦ · EDYCJA · ✦</span>
                    </div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="parchment-input font-serif"
                      style={{ fontSize: "1.05rem" }}
                      data-testid={`input-edit-title-${entry.id}`}
                    />
                    <div className="space-y-1.5">
                      <label className="parchment-label flex items-center gap-2">
                        <span>Nastrój duszy</span>
                        <span className="text-xl">{editEmoji}</span>
                      </label>
                      <EmojiPicker value={editEmoji} onChange={setEditEmoji} testIdPrefix={`edit-${entry.id}`} />
                    </div>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={7}
                      className="parchment-textarea"
                      data-testid={`textarea-edit-content-${entry.id}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(entry.id)}
                        disabled={updateEntry.isPending}
                        className="btn-burgundy text-xs px-4 py-1.5"
                        data-testid={`button-confirm-edit-${entry.id}`}
                      >
                        <Check className="w-3 h-3" /> Zapisz
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-ghost text-xs px-4 py-1.5"
                        data-testid={`button-cancel-edit-${entry.id}`}
                      >
                        <X className="w-3 h-3" /> Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <>
                    {/* Page ornament */}
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: "#D4AF37", fontSize: "0.55rem", letterSpacing: "0.4em", opacity: 0.5 }}>✦</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.22)" }} />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title with mood emoji */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-2xl shrink-0" data-testid={`emoji-journal-${entry.id}`}>
                            {entry.mood || DEFAULT_EMOJI}
                          </span>
                          <h3 className="font-serif font-semibold text-xl text-foreground">{entry.title}</h3>
                        </div>
                        <p className="text-xs font-sans mb-4" style={{ color: "#C9952A", opacity: 0.8, letterSpacing: "0.03em" }}>
                          {new Date(entry.createdAt).toLocaleDateString("pl-PL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <p className="font-serif text-sm leading-[1.9] text-foreground line-clamp-5" style={{ letterSpacing: "0.01em" }}>
                          {entry.content}
                        </p>
                      </div>

                      {/* Action icons — appear on hover */}
                      <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          data-testid={`button-edit-${entry.id}`}
                          title="Edytuj"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          data-testid={`button-delete-${entry.id}`}
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom ornament */}
                    <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(212,175,55,0.18)" }}>
                      <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.18)" }} />
                      <span style={{ color: "#D4AF37", fontSize: "0.5rem", letterSpacing: "0.5em", opacity: 0.45 }}>✾ · ⁕ · ✾</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.18)" }} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
