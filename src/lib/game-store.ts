import { create } from "zustand";
import { persist } from "zustand/middleware";
import { t, type Locale } from "@/lib/i18n";
import { deckFor, type GameMode, type Prompt, type PromptKind } from "@/lib/prompts";

export type Gender = "male" | "female";

export type Player = { id: string; name: string; gender: Gender };

export type Phase = "setup" | "turn" | "card";

type GameState = {
  players: Player[];
  currentIndex: number;
  mode: GameMode;
  locale: Locale;
  customPrompts: Prompt[];
  usedIds: string[];
  lastPrompt: Prompt | null;
  phase: Phase;
  round: number;
  addPlayer: (name: string, gender: Gender) => void;
  removePlayer: (id: string) => void;
  setPlayerGender: (id: string, gender: Gender) => void;
  setMode: (mode: GameMode) => void;
  setLocale: (locale: Locale) => void;
  addCustom: (kind: PromptKind, text: string) => void;
  removeCustom: (id: string) => void;
  start: () => void;
  draw: (kind: PromptKind | "either") => void;
  completeTurn: () => void;
  resetToSetup: () => void;
  reshuffle: () => void;
};

function uid() {
  return crypto.randomUUID();
}

function pick<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      currentIndex: 0,
      mode: "friendly",
      locale: "en",
      customPrompts: [],
      usedIds: [],
      lastPrompt: null,
      phase: "setup",
      round: 1,
      addPlayer: (name, gender) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((s) => ({
          players: [...s.players, { id: uid(), name: trimmed.slice(0, 24), gender }],
        }));
      },
      setPlayerGender: (id, gender) => {
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, gender } : p)),
        }));
      },
      removePlayer: (id) => {
        set((s) => {
          const players = s.players.filter((p) => p.id !== id);
          const currentIndex = players.length === 0 ? 0 : s.currentIndex % players.length;
          return { players, currentIndex };
        });
      },
      setMode: (mode) => set({ mode }),
      setLocale: (locale) => set({ locale }),
      addCustom: (kind, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          customPrompts: [
            ...s.customPrompts,
            { id: uid(), kind, mode: s.mode, en: trimmed, ru: trimmed, custom: true },
          ],
        }));
      },
      removeCustom: (id) => {
        set((s) => ({ customPrompts: s.customPrompts.filter((p) => p.id !== id) }));
      },
      start: () => {
        const { players } = get();
        if (players.length < 1) return;
        set({ phase: "turn", currentIndex: 0, usedIds: [], lastPrompt: null, round: 1 });
      },
      draw: (kind) => {
        const { mode, customPrompts, usedIds } = get();
        const deck = deckFor(mode, customPrompts);
        const wanted = kind === "either" ? deck : deck.filter((p) => p.kind === kind);
        let pool = wanted.filter((p) => !usedIds.includes(p.id));
        if (pool.length === 0) pool = wanted;
        const prompt = pick(pool);
        if (!prompt) return;
        const nextUsed = pool === wanted ? [prompt.id] : [...usedIds, prompt.id];
        set({ lastPrompt: prompt, usedIds: nextUsed, phase: "card" });
      },
      completeTurn: () => {
        const { players, currentIndex } = get();
        if (players.length === 0) {
          set({ phase: "setup" });
          return;
        }
        const next = (currentIndex + 1) % players.length;
        set({
          currentIndex: next,
          phase: "turn",
          lastPrompt: null,
          round: next === 0 ? get().round + 1 : get().round,
        });
      },
      resetToSetup: () => {
        set({ phase: "setup", lastPrompt: null, usedIds: [], currentIndex: 0, round: 1 });
      },
      reshuffle: () => set({ usedIds: [], lastPrompt: null }),
    }),
    {
      name: "circle-truth-dare",
      version: 3,
      migrate: (persisted) => {
        const p = persisted as Record<string, unknown>;
        const packs = p.packs as string[] | undefined;
        const mode: GameMode =
          p.mode === "adult" || p.mode === "friendly"
            ? p.mode
            : packs?.includes("bold")
              ? "adult"
              : "friendly";
        const locale: Locale = p.locale === "ru" ? "ru" : "en";
        const customRaw = Array.isArray(p.customPrompts) ? p.customPrompts : [];
        const customPrompts: Prompt[] = customRaw.map((item) => {
          const c = item as Record<string, unknown>;
          const text = String(c.en ?? c.ru ?? c.text ?? "");
          return {
            id: String(c.id ?? uid()),
            kind: c.kind === "dare" ? "dare" : "truth",
            mode: c.mode === "adult" ? "adult" : "friendly",
            en: text,
            ru: text,
            custom: true,
          };
        });
        const playersRaw = Array.isArray(p.players) ? p.players : [];
        const players = playersRaw.map((item) => {
          const pl = item as Record<string, unknown>;
          return {
            id: String(pl.id ?? uid()),
            name: String(pl.name ?? ""),
            gender: pl.gender === "female" ? ("female" as const) : ("male" as const),
          };
        });
        return { ...p, mode, locale, customPrompts, players };
      },
    },
  ),
);

export function useCopy() {
  const locale = useGame((s) => s.locale);
  return t(locale);
}
