import {
  Music2, Mic, Cpu, Gamepad2, Skull, Flame, Compass, Guitar,
  Waves, Radio, Drum, Zap, Film, Star, Headphones, Volume2,
  SlidersHorizontal, Disc3, Speaker, Layers,
  type LucideIcon,
} from "lucide-react";

export const GENRE_ICON_MAP: Record<string, LucideIcon> = {
  Music2, Mic, Cpu, Gamepad2, Skull, Flame, Compass, Guitar,
  Waves, Radio, Drum, Zap, Film, Star, Headphones, Volume2,
  SlidersHorizontal, Disc3, Speaker, Layers,
};

export type GenreGroup = {
  label: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  activeBorder: string;
  activeBg: string;
  icons: { name: string; icon: LucideIcon }[];
};

export const GENRE_ICON_GROUPS: GenreGroup[] = [
  {
    label: "Rock / Metal",
    textColor: "text-red-400", borderColor: "border-red-500/25", bgColor: "bg-red-500/5",
    activeBorder: "border-red-400", activeBg: "bg-red-500/20",
    icons: [
      { name: "Guitar", icon: Guitar }, { name: "Zap", icon: Zap },
      { name: "Drum", icon: Drum },     { name: "Skull", icon: Skull },
    ],
  },
  {
    label: "Rap / Hip-Hop",
    textColor: "text-yellow-400", borderColor: "border-yellow-500/25", bgColor: "bg-yellow-500/5",
    activeBorder: "border-yellow-400", activeBg: "bg-yellow-500/20",
    icons: [
      { name: "Mic", icon: Mic },         { name: "Headphones", icon: Headphones },
      { name: "Music2", icon: Music2 },   { name: "Volume2", icon: Volume2 },
    ],
  },
  {
    label: "Electronic",
    textColor: "text-blue-400", borderColor: "border-blue-500/25", bgColor: "bg-blue-500/5",
    activeBorder: "border-blue-400", activeBg: "bg-blue-500/20",
    icons: [
      { name: "Cpu", icon: Cpu }, { name: "Waves", icon: Waves },
      { name: "Radio", icon: Radio }, { name: "Zap", icon: Zap },
    ],
  },
  {
    label: "Video Games",
    textColor: "text-cyan-400", borderColor: "border-cyan-500/25", bgColor: "bg-cyan-500/5",
    activeBorder: "border-cyan-400", activeBg: "bg-cyan-500/20",
    icons: [
      { name: "Gamepad2", icon: Gamepad2 }, { name: "Star", icon: Star },
      { name: "Compass", icon: Compass },   { name: "Cpu", icon: Cpu },
    ],
  },
  {
    label: "Horror",
    textColor: "text-red-500", borderColor: "border-red-600/25", bgColor: "bg-red-600/5",
    activeBorder: "border-red-500", activeBg: "bg-red-600/20",
    icons: [
      { name: "Skull", icon: Skull }, { name: "Flame", icon: Flame },
      { name: "Zap", icon: Zap },     { name: "Volume2", icon: Volume2 },
    ],
  },
  {
    label: "Action",
    textColor: "text-orange-400", borderColor: "border-orange-500/25", bgColor: "bg-orange-500/5",
    activeBorder: "border-orange-400", activeBg: "bg-orange-500/20",
    icons: [
      { name: "Flame", icon: Flame }, { name: "Zap", icon: Zap },
      { name: "Star", icon: Star },   { name: "Guitar", icon: Guitar },
    ],
  },
  {
    label: "Adventure",
    textColor: "text-emerald-400", borderColor: "border-emerald-500/25", bgColor: "bg-emerald-500/5",
    activeBorder: "border-emerald-400", activeBg: "bg-emerald-500/20",
    icons: [
      { name: "Compass", icon: Compass }, { name: "Star", icon: Star },
      { name: "Waves", icon: Waves },     { name: "Film", icon: Film },
    ],
  },
  {
    label: "Cinematic",
    textColor: "text-purple-400", borderColor: "border-purple-500/25", bgColor: "bg-purple-500/5",
    activeBorder: "border-purple-400", activeBg: "bg-purple-500/20",
    icons: [
      { name: "Film", icon: Film },   { name: "Waves", icon: Waves },
      { name: "Music2", icon: Music2 }, { name: "Star", icon: Star },
    ],
  },
  {
    label: "Ambient",
    textColor: "text-indigo-400", borderColor: "border-indigo-500/25", bgColor: "bg-indigo-500/5",
    activeBorder: "border-indigo-400", activeBg: "bg-indigo-500/20",
    icons: [
      { name: "Waves", icon: Waves },       { name: "Headphones", icon: Headphones },
      { name: "Radio", icon: Radio },       { name: "Volume2", icon: Volume2 },
    ],
  },
  {
    label: "Synthwave",
    textColor: "text-pink-400", borderColor: "border-pink-500/25", bgColor: "bg-pink-500/5",
    activeBorder: "border-pink-400", activeBg: "bg-pink-500/20",
    icons: [
      { name: "Radio", icon: Radio }, { name: "Cpu", icon: Cpu },
      { name: "Zap", icon: Zap },     { name: "Waves", icon: Waves },
    ],
  },
  {
    label: "Percussion",
    textColor: "text-amber-400", borderColor: "border-amber-500/25", bgColor: "bg-amber-500/5",
    activeBorder: "border-amber-400", activeBg: "bg-amber-500/20",
    icons: [
      { name: "Drum", icon: Drum },     { name: "Zap", icon: Zap },
      { name: "Volume2", icon: Volume2 }, { name: "Music2", icon: Music2 },
    ],
  },
  {
    label: "Industrial",
    textColor: "text-slate-400", borderColor: "border-slate-500/25", bgColor: "bg-slate-500/5",
    activeBorder: "border-slate-400", activeBg: "bg-slate-500/20",
    icons: [
      { name: "Zap", icon: Zap },  { name: "Cpu", icon: Cpu },
      { name: "Drum", icon: Drum }, { name: "Skull", icon: Skull },
    ],
  },
  {
    label: "Lo-fi",
    textColor: "text-sky-400", borderColor: "border-sky-500/25", bgColor: "bg-sky-500/5",
    activeBorder: "border-sky-400", activeBg: "bg-sky-500/20",
    icons: [
      { name: "Headphones", icon: Headphones }, { name: "Music2", icon: Music2 },
      { name: "Waves", icon: Waves },           { name: "Radio", icon: Radio },
    ],
  },
  {
    label: "Sound Design",
    textColor: "text-teal-400", borderColor: "border-teal-500/25", bgColor: "bg-teal-500/5",
    activeBorder: "border-teal-400", activeBg: "bg-teal-500/20",
    icons: [
      { name: "Volume2", icon: Volume2 },           { name: "Waves", icon: Waves },
      { name: "Cpu", icon: Cpu },                   { name: "SlidersHorizontal", icon: SlidersHorizontal },
    ],
  },
];
