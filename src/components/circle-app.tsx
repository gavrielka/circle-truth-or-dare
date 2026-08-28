import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopy, useGame, type Gender, type Player } from "@/lib/game-store";
import type { Locale } from "@/lib/i18n";
import type { GameMode, PromptKind } from "@/lib/prompts";
import { promptText } from "@/lib/prompts";
import { cn } from "@/lib/utils";

const ROW_TONES = [
  "bg-cyan text-cyan-fg",
  "bg-sun text-sun-fg",
  "bg-orange text-orange-fg",
  "bg-primary text-primary-fg",
] as const;

function avatarSrc(gender: Gender) {
  return gender === "male" ? "/avatars/fox.svg" : "/avatars/bunny.svg";
}

export function CircleApp() {
  const phase = useGame((s) => s.phase);
  const locale = useGame((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-bg text-fg">
      <div aria-hidden className="pointer-events-none absolute -left-16 top-10 h-56 w-56 blob bg-cyan/25 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -right-10 top-40 h-64 w-64 blob-alt bg-primary/25 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-10 left-1/3 h-48 w-48 blob bg-violet/30 blur-2xl" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-y-auto px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div key={phase} className="flex flex-1 flex-col">
          {phase === "setup" ? <SetupView /> : null}
          {phase === "turn" ? <TurnView /> : null}
          {phase === "card" ? <CardView /> : null}
        </div>
      </div>
    </div>
  );
}

function LanguageSwitch() {
  const locale = useGame((s) => s.locale);
  const setLocale = useGame((s) => s.setLocale);
  const copy = useCopy();
  return (
    <div className="flex rounded-full bg-surface p-1" role="group" aria-label={copy.language}>
      {(["en", "ru"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            "h-8 min-w-10 rounded-full px-3 text-xs font-extrabold",
            locale === code ? "bg-primary text-primary-fg" : "text-muted",
          )}
        >
          {code === "en" ? "EN" : "RU"}
        </button>
      ))}
    </div>
  );
}

function Mascot({ gender, className, selected }: { gender: Gender; className?: string; selected?: boolean }) {
  return (
    <img
      src={avatarSrc(gender)}
      alt=""
      className={cn(
        "rounded-full object-cover ring-4 transition-[transform,box-shadow,ring-color] duration-200",
        selected ? "ring-primary scale-105" : "ring-transparent",
        className,
      )}
    />
  );
}

function SetupView() {
  const copy = useCopy();
  const players = useGame((s) => s.players);
  const mode = useGame((s) => s.mode);
  const addPlayer = useGame((s) => s.addPlayer);
  const removePlayer = useGame((s) => s.removePlayer);
  const setPlayerGender = useGame((s) => s.setPlayerGender);
  const setMode = useGame((s) => s.setMode);
  const start = useGame((s) => s.start);
  const [name, setName] = useState("");
  const [draftGender, setDraftGender] = useState<Gender>("female");
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customKind, setCustomKind] = useState<PromptKind>("truth");
  const addCustom = useGame((s) => s.addCustom);
  const removeCustom = useGame((s) => s.removeCustom);
  const customPrompts = useGame((s) => s.customPrompts);
  const locale = useGame((s) => s.locale);
  const modeCustom = customPrompts.filter((p) => p.mode === mode);
  function onAdd(e: FormEvent) {
    e.preventDefault();
    addPlayer(name, draftGender);
    setName("");
  }
  function onCustom(e: FormEvent) {
    e.preventDefault();
    addCustom(customKind, customText);
    setCustomText("");
  }
  return (
    <div className="flex flex-1 flex-col gap-4 py-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan">Circle</p>
        <LanguageSwitch />
      </div>
      <header className="rise-in text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.title}</h1>
      </header>
      <section className="rise-in rise-in-delay-1 flex justify-center gap-8">
        {(["male", "female"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setDraftGender(g)}
            className="flex flex-col items-center gap-2"
            aria-pressed={draftGender === g}
            aria-label={g === "male" ? copy.male : copy.female}
          >
            <span className={cn("grid size-20 place-items-center sm:size-24", g === "male" ? "blob bg-cyan/80" : "blob-alt bg-primary/80")}>
              <Mascot gender={g} selected={draftGender === g} className="size-16 sm:size-20" />
            </span>
            <span className="text-sm font-extrabold">{g === "male" ? copy.male : copy.female}</span>
          </button>
        ))}
      </section>
      <form onSubmit={onAdd} className="rise-in rise-in-delay-2 space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.addName} aria-label={copy.addName} maxLength={24} autoComplete="off" className="h-12 rounded-2xl border-0 bg-surface text-center font-bold" />
        <Button type="submit" variant="cyan" className="w-full rounded-full font-extrabold"><Plus />{copy.addPlayer}</Button>
      </form>
      {players.length === 0 ? (
        <p className="text-center text-sm font-semibold text-muted">{copy.needPlayer}</p>
      ) : (
        <ul className="space-y-2">
          {players.map((p, i) => (
            <li key={p.id}>
              <PlayerRow player={p} tone={ROW_TONES[i % ROW_TONES.length]} onToggle={() => setPlayerGender(p.id, p.gender === "male" ? "female" : "male")} onRemove={() => removePlayer(p.id)} />
            </li>
          ))}
        </ul>
      )}
      <section className="rise-in rise-in-delay-3 space-y-2">
        <h2 className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-muted">{copy.mode}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["friendly", "adult"] as GameMode[]).map((id) => (
            <button key={id} type="button" onClick={() => setMode(id)} className={cn("h-12 rounded-full text-sm font-extrabold transition-colors duration-150", mode === id ? (id === "adult" ? "bg-primary text-primary-fg" : "bg-cyan text-cyan-fg") : "bg-surface text-muted")}>
              {id === "friendly" ? copy.friendly : copy.adult}
            </button>
          ))}
        </div>
        <p className="text-center text-xs font-semibold text-subtle">{mode === "adult" ? copy.adultBlurb : copy.friendlyBlurb}</p>
      </section>
      <button type="button" onClick={() => setShowCustom((v) => !v)} className="text-center text-sm font-bold text-muted underline-offset-4 hover:text-fg hover:underline">
        {showCustom ? copy.customHide : copy.customShow}
      </button>
      {showCustom ? (
        <div className="space-y-3 rounded-3xl bg-surface p-4">
          <div className="flex gap-2">
            {(["truth", "dare"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setCustomKind(k)} className={cn("h-10 flex-1 rounded-full text-sm font-extrabold", customKind === k ? "bg-primary text-primary-fg" : "bg-raised text-muted")}>
                {k === "truth" ? copy.truth : copy.dare}
              </button>
            ))}
          </div>
          <form onSubmit={onCustom} className="flex gap-2">
            <Input value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder={copy.writePrompt} className="rounded-2xl border-0 bg-raised" />
            <Button type="submit" size="icon" variant="cyan" aria-label={copy.savePrompt}><Plus /></Button>
          </form>
          {modeCustom.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-2 text-sm">
              <span>{promptText(p, locale)}</span>
              <button type="button" onClick={() => removeCustom(p.id)} aria-label={copy.removePlayer}><X className="size-4" /></button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="sticky bottom-0 z-10 mt-auto bg-bg/90 py-3 backdrop-blur-sm">
        <Button className="h-14 w-full rounded-full text-lg font-extrabold uppercase tracking-wide" size="lg" disabled={players.length < 1} onClick={start}>{copy.start}</Button>
      </div>
    </div>
  );
}

function PlayerRow({ player, tone, onToggle, onRemove }: { player: Player; tone: string; onToggle: () => void; onRemove: () => void }) {
  const copy = useCopy();
  return (
    <div className={cn("chip-in flex h-14 items-center gap-2 rounded-2xl px-2 font-extrabold", tone)}>
      <button type="button" onClick={onToggle} aria-label={copy.changeGender} className="shrink-0">
        <Mascot gender={player.gender} className="size-10 ring-2 ring-white/40" />
      </button>
      <span className="min-w-0 flex-1 truncate">{player.name}</span>
      <button type="button" className="grid size-10 place-items-center rounded-full bg-black/10" aria-label={`${copy.removePlayer} ${player.name}`} onClick={onRemove}>
        <X className="size-4" />
      </button>
    </div>
  );
}

function Bottle() {
  return (
    <svg viewBox="0 0 32 72" className="h-[4.5rem] w-8 drop-shadow-md" aria-hidden>
      <rect x="12" y="2" width="8" height="12" rx="2" fill="#f7f4ff" />
      <path d="M10 14h12l5 14v28a7 7 0 0 1-7 7h-8a7 7 0 0 1-7-7V28z" fill="#3ee0ea" />
      <path d="M10 30h18" stroke="#160e2e" strokeOpacity="0.25" />
    </svg>
  );
}

function TurnView() {
  const copy = useCopy();
  const players = useGame((s) => s.players);
  const currentIndex = useGame((s) => s.currentIndex);
  const draw = useGame((s) => s.draw);
  const resetToSetup = useGame((s) => s.resetToSetup);
  const setPlayerGender = useGame((s) => s.setPlayerGender);
  const player = players[currentIndex];
  const next = players.length ? players[(currentIndex + 1) % players.length] : undefined;
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  function spinEither() {
    if (spinning) return;
    setSpinning(true);
    const extra = 1080 + Math.floor(Math.random() * 360);
    setDeg((d) => d + extra);
    window.setTimeout(() => {
      setSpinning(false);
      draw(Math.random() < 0.5 ? "truth" : "dare");
    }, 1400);
  }
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between py-1">
        <Button variant="ghost" size="icon" aria-label={copy.back} onClick={resetToSetup}><ArrowLeft /></Button>
        <h1 className="text-lg font-extrabold">{copy.title}</h1>
        <LanguageSwitch />
      </header>
      <div className="flex items-end justify-center gap-4 py-3">
        {player ? (
          <div className="flex flex-col items-center">
            <button type="button" className="blob grid size-28 place-items-center bg-cyan" aria-label={copy.changeGender} onClick={() => setPlayerGender(player.id, player.gender === "male" ? "female" : "male")}>
              <Mascot gender={player.gender} className="size-24" />
            </button>
            <h2 key={player.id} className="name-swap mt-2 text-xl font-extrabold">{player.name}</h2>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan">{copy.upNow}</p>
          </div>
        ) : null}
        {next && next.id !== player?.id ? (
          <div className="mb-6 flex flex-col items-center opacity-90">
            <div className="blob-alt grid size-16 place-items-center bg-primary"><Mascot gender={next.gender} className="size-14" /></div>
            <p className="mt-1 max-w-16 truncate text-center text-[11px] font-extrabold text-muted">{next.name}</p>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative grid size-40 place-items-center sm:size-48">
          <div className="wheel absolute inset-0 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.35)]" style={{ transform: `rotate(${deg}deg)` }} />
          <div className="absolute inset-4 rounded-full bg-bg" />
          <div className="bottle relative z-10" style={{ transform: `rotate(${deg}deg)` }}><Bottle /></div>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <Button variant="cyan" className="h-16 rounded-3xl text-lg font-extrabold" disabled={spinning} onClick={() => draw("truth")}>{copy.truth}</Button>
        <Button className="h-16 rounded-3xl text-lg font-extrabold" disabled={spinning} onClick={() => draw("dare")}>{copy.dare}</Button>
        <Button variant="sun" className="col-span-2 h-14 rounded-full text-base font-extrabold" disabled={spinning} onClick={spinEither}>{spinning ? copy.spin : copy.goNow}</Button>
      </div>
    </div>
  );
}

function CardView() {
  const copy = useCopy();
  const lastPrompt = useGame((s) => s.lastPrompt);
  const players = useGame((s) => s.players);
  const currentIndex = useGame((s) => s.currentIndex);
  const completeTurn = useGame((s) => s.completeTurn);
  const draw = useGame((s) => s.draw);
  const locale = useGame((s) => s.locale);
  const player = players[currentIndex];
  const kindLabel = lastPrompt?.kind === "dare" ? copy.dare : copy.truth;
  const nextName = useMemo(() => {
    if (players.length === 0) return "";
    return players[(currentIndex + 1) % players.length]?.name ?? "";
  }, [players, currentIndex]);
  if (!lastPrompt) return null;
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between py-1">
        <p className="inline-flex items-center gap-2 text-sm font-extrabold">
          {player ? <Mascot gender={player.gender} className="size-8" /> : null}
          {player?.name}
        </p>
        <LanguageSwitch />
      </header>
      <div className="flex flex-1 flex-col justify-center py-6">
        <article key={lastPrompt.id} className={cn("card-flip rounded-[32px] px-6 py-10", lastPrompt.kind === "dare" ? "bg-primary text-primary-fg" : "bg-cyan text-cyan-fg")}>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] opacity-80">{kindLabel}</p>
          <p className="mt-4 font-display text-2xl font-extrabold leading-snug">{promptText(lastPrompt, locale)}</p>
        </article>
      </div>
      <div className="grid gap-2">
        <Button className="h-14 w-full rounded-full font-extrabold" size="lg" onClick={completeTurn}>
          {copy.done}{nextName ? ` · ${nextName}` : ""}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="cyan" onClick={() => draw(lastPrompt.kind)}><RotateCcw className="size-4" />{copy.newPrompt}</Button>
          <Button variant="ghost" onClick={completeTurn}>{copy.skip}</Button>
        </div>
      </div>
    </div>
  );
}
