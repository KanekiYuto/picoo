export type AspectRatio = `${number}:${number}`;

export interface GeneratorSettings {
  model: string;
  aspectRatio: AspectRatio;
  variations: 1 | 2 | 3 | 4;
  visibility: "public" | "private";
}

