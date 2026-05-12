import { useState } from "react";
import {
  useListDreams,
  useCreateDream,
  useDeleteDream,
  getListDreamsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Plus, Trash2 } from "lucide-react";

const FEELING_EMOJIS = ["✨", "🌙", "💫", "🌊", "🌸", "😌", "😴", "🌀", "🔮", "🌈", "🦋", "🌺", "💭", "🌟", "🕊️", "🌌", "😇", "❤️"];

const TAG_PALETTE = [
  { bg: "rgba(212,175,55,0.12)", border: "rgba(212,175,55,0.45)", color: "#9A6220" },
  { bg: "rgba(139,0,0,0.07)",   border: "rgba(139,0,0,0.25)",    color: "#8B0000" },
  { bg: "rgba(100,149,237,0.1)",border: "rgba(100,149,237,0.35)",color: "#4169B0" },
  { bg: "rgba(147,112,219,0.1)",border: "rgba(147,112,219,0.35)",color: "#7B55A0" },
  { bg: "rgba(60,179,113,0.1)", border: "rgba(60,179,113,0.35)", color: "#2E8B57" },
];

function tagStyle(index: number) {
  const p = TAG_PALETTE[index % TAG_PALETTE.length];
  return { background: p.bg, border: `1px solid ${p.border}`, color: p.color };
}

export default function DreamsPage() {
  const queryClient = useQueryClient();
  const { data: dreams = [], isLoading } = useListDreams();
  const createDream = useCreateDream();
  const deleteDream = useDeleteDream();

  const [showForm, setShowForm] = useState(false);
  const today = () => new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [feeling, setFeeling] = useState("🌙");

  const handleCreate = () => {
    if (!description.trim()) return;
    createDream.mutate(
      { data: { date, description: description.trim(), feeling, tags: [] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDreamsQueryKey() });
          setDescription("");
          setFeeling("🌙");
          setDate(today());
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteDream.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDreamsQueryKey() }) }
    );
  };

  return (
    <Layout>
      <div className="space-y-8 page-section">

        {/* Heading with glowing moon */}
        <div className="space-y-2 fade-up" style={{ animationDelay: "0ms" }}>
          <h1 className="text-4xl font-serif font-semibold text-primary flex items-center gap-3" data-testid="heading-dreams">
            <span className="moon-glow">☽</span>
            Moje Sny
          </h1>
          <p className="text-muted-foreground font-sans text-sm italic pl-11">
            Księga nocnych wędrówek Twojej duszy
          </p>
        </div>

        {/* Add button — serif, gold border */}
        <div className="fade-up" style={{ animationDelay: "60ms" }}>
          <button
            onClick={() => { const opening = !showForm; setShowForm(opening); if (opening) setDate(today()); }}
            className="btn-gold-outline"
            data-testid="button-add-dream"
          >
            <Plus className="w-4 h-4" />
            <span className="font-serif italic">Zapisz nowy sen</span>
          </button>
        </div>

        {/* New dream form */}
        {showForm && (
          <div className="parchment-card space-y-5 fade-up" data-testid="form-new-dream">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "#D4AF37", fontSize: "0.7rem", letterSpacing: "0.4em", opacity: 0.7 }}>✦ · ✦</span>
            </div>
            <h2 className="font-serif font-semibold text-foreground text-xl">Nowy sen</h2>

            <div className="space-y-1">
              <label className="parchment-label">Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="parchment-input"
                data-testid="input-dream-date"
              />
            </div>

            <div className="space-y-2">
              <label className="parchment-label">Emocja snu</label>
              <div className="grid grid-cols-9 gap-2 p-3 rounded-xl" style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)" }} data-testid="grid-feeling-emojis">
                {FEELING_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setFeeling(emoji)}
                    className={`text-2xl hover:scale-125 transition-transform rounded-lg py-1 ${feeling === emoji ? "ring-2" : ""}`}
                    style={feeling === emoji ? { background: "rgba(212,175,55,0.15)", ringColor: "#D4AF37", outline: "2px solid rgba(212,175,55,0.6)" } : {}}
                    data-testid={`emoji-feeling-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="parchment-label">Opis snu</label>
              <textarea
                placeholder="Opisz swój sen... Co widziałaś? Co czułaś? Jakie obrazy zostały w pamięci?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                className="parchment-textarea"
                data-testid="textarea-dream-description"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleCreate}
                disabled={!description.trim() || createDream.isPending}
                className="btn-burgundy"
                data-testid="button-save-dream"
              >
                {createDream.isPending ? "Zapisuję..." : "Zapisz sen"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-ghost"
                data-testid="button-cancel-dream"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Dreams list */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-serif italic">Ładowanie snów...</div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-16 space-y-3 fade-up" data-testid="empty-dreams">
            <p className="text-4xl">🌙</p>
            <p className="font-serif text-muted-foreground italic">Nie zapisałaś jeszcze żadnych snów.</p>
            <p className="text-sm font-sans text-muted-foreground">Sny to listy od naszej podświadomości. Warto je przechowywać.</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="list-dreams">
            {dreams.map((dream, i) => (
              <div
                key={dream.id}
                className="dream-card group fade-up"
                style={{ animationDelay: `${120 + i * 60}ms` }}
                data-testid={`card-dream-${dream.id}`}
              >
                <div className="flex items-start gap-4">
                  {/* Feeling emoji */}
                  <span className="text-4xl shrink-0 mt-1">{dream.feeling}</span>

                  <div className="flex-1 min-w-0">
                    {/* Date */}
                    <p className="text-xs font-sans mb-2" style={{ color: "#C9952A", letterSpacing: "0.04em" }}>
                      {new Date(dream.date).toLocaleDateString("pl-PL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    {/* Description */}
                    <p className="text-sm font-serif leading-relaxed text-foreground">{dream.description}</p>

                    {/* Tags as gem buttons */}
                    {Array.isArray(dream.tags) && dream.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {dream.tags.map((tag, ti) => (
                          <span key={tag} className="gem-tag" style={tagStyle(ti)}>
                            ✦ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete — visible on hover */}
                  <button
                    onClick={() => handleDelete(dream.id)}
                    className="shrink-0 text-destructive transition-colors"
                    data-testid={`button-delete-dream-${dream.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom gold ornament */}
                <div className="mt-4 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(212,175,55,0.2)" }}>
                  <span style={{ color: "#D4AF37", fontSize: "0.5rem", letterSpacing: "0.5em", opacity: 0.5 }}>⋆ · ⋆ · ⋆</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
