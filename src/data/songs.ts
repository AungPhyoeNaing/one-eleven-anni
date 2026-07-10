export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audio: string;
  message: string;
  color: string;
}

export const songs: Song[] = [
  {
    id: "my-universe",
    title: "Forever Melody",
    artist: "Coldplay X BTS",
    cover: "/images/cover_my_universe.jpg",
    audio: "/music/Coldplay X BTS - My Universe.mp3",
    message: "This song reminds me of the moments I smile because of you. You are my universe.",
    color: "#b66898"
  },
  {
    id: "world-on-fire",
    title: "My Favorite Memory",
    artist: "Loving Caliber",
    cover: "/images/cover_world_on_fire.jpg",
    audio: "/music/Loving Caliber - You Set My World On Fire.mp3",
    message: "Every time this plays, I think of the warmth you brought into my life.",
    color: "#ff7f50"
  },
  {
    id: "christmas-tree",
    title: "Our First Song",
    artist: "V",
    cover: "/images/cover_christmas_tree.jpg",
    audio: "/music/V - Christmas Tree.mp3",
    message: "Like a star on a Christmas tree, you light up my darkest nights.",
    color: "#2e8b57"
  }
];
