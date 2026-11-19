export const artworkWidth = 900;
export const artworkHeight = 540;
export const framesPerChapter = 60;

export type ShowcaseChapter = {
  id: string;
  label: string;
  artwork: string;
};

// Use the same position for the illustration and the selected jump link.
export function chapterPosition(anchors: number[], readingLine: number) {
  for (let index = 1; index < anchors.length; index++) {
    if (readingLine <= anchors[index]) {
      const span = Math.max(1, anchors[index] - anchors[index - 1]);
      return index - 1 + Math.max(0, (readingLine - anchors[index - 1]) / span);
    }
  }
  return Math.max(0, anchors.length - 1);
}
