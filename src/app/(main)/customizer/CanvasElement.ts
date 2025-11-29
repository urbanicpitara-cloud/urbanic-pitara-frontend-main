interface CanvasElement {
  id: string;
  type: "image" | "text";
  src?: string;        // only for images
  text?: string;       // only for text
  fontSize?: number;   // for text
  fontFamily?: string; // for text
  fill?: string;       // text color
  x: number;
  y: number;
  width: number;
  height: number;
}
