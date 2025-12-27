export type AspectRatio = `${number}:${number}`;

export type AspectRatioOption = {
  portrait: AspectRatio;
  landscape?: AspectRatio;
};

export interface GeneratorSettings {
  model: string;
  aspectRatio: AspectRatio;
  variations: 1 | 2 | 3 | 4;
  visibility: "public" | "private";
}
