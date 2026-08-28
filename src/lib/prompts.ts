export type PromptKind = "truth" | "dare";
export type GameMode = "friendly" | "adult";

export type Prompt = {
  id: string;
  kind: PromptKind;
  mode: GameMode;
  en: string;
  ru: string;
  custom?: boolean;
};

export const BUILTIN_PROMPTS: Prompt[] = [
  { id: "ft1", kind: "truth", mode: "friendly", en: "What is a small thing that made this week better?", ru: "Какая мелочь улучшила тебе эту неделю?" },
  { id: "ft2", kind: "truth", mode: "friendly", en: "Who in this room would you want as a road-trip copilot?", ru: "Кого из этой комнаты ты возьмёшь штурманом в поездку?" },
  { id: "ft3", kind: "truth", mode: "friendly", en: "What song would you put on if you had the aux right now?", ru: "Какую песню ты поставил бы, если бы тебе дали колонку?" },
  { id: "ft4", kind: "truth", mode: "friendly", en: "What hobby do you pretend to be better at than you are?", ru: "В каком хобби ты притворяешься лучше, чем есть?" },
  { id: "ft5", kind: "truth", mode: "friendly", en: "What is the last thing you googled that you would rather not admit?", ru: "Что ты гуглил в последний раз и не очень хочешь в этом признаваться?" },
  { id: "fd1", kind: "dare", mode: "friendly", en: "Give a 20-second toast to the person on your right.", ru: "Произнеси тост на 20 секунд человеку справа." },
  { id: "fd2", kind: "dare", mode: "friendly", en: "Swap seats with someone and stay there for two turns.", ru: "Поменяйся местами с кем-то и сиди там два хода." },
  { id: "fd3", kind: "dare", mode: "friendly", en: "Do your best impression of how you walk into a room.", ru: "Покажи, как ты обычно входишь в комнату." },
  { id: "at1", kind: "truth", mode: "adult", en: "What is an unpopular opinion you hold about this friend group?", ru: "Какое непопулярное мнение у тебя есть об этой компании?" },
  { id: "at2", kind: "truth", mode: "adult", en: "Who here do you underestimate, and what would change if you stopped?", ru: "Кого здесь ты недооцениваешь — и что изменится, если перестанешь?" },
  { id: "ad1", kind: "dare", mode: "adult", en: "Look at each person and say one true thing you admire about them.", ru: "Посмотри на каждого и скажи одну правду, которой ты в нём восхищаешься." },
  { id: "ad2", kind: "dare", mode: "adult", en: "Tell the group about a time you were wrong and stayed quiet.", ru: "Расскажи, когда ты был неправ и промолчал." },
];

export function deckFor(mode: GameMode, custom: Prompt[]): Prompt[] {
  return [
    ...BUILTIN_PROMPTS.filter((p) => p.mode === mode),
    ...custom.filter((p) => p.mode === mode),
  ];
}

export function promptText(prompt: Prompt, locale: "en" | "ru"): string {
  return locale === "ru" ? prompt.ru : prompt.en;
}
