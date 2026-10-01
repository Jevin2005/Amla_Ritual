export type BackgroundFit = "cover" | "fill" | "edges";

// Preserve the top/bottom artwork at its natural proportions. The image's own
// middle tone bridges the sections, rather than stretching its shadows/texture.
export function backgroundSlices(imageWidth: number, imageHeight: number, width: number, height: number, fit: BackgroundFit = "cover") {
  if (fit !== "edges" || imageHeight * width / imageWidth >= height) {
    const crop = backgroundCrop(imageWidth, imageHeight, width, height, fit === "edges" ? "cover" : fit);
    return [{ ...crop, dx: 0, dy: 0, dw: width, dh: height }];
  }
  const sourceEdge = imageHeight * .5;
  const edge = sourceEdge * width / imageWidth;
  return [
    { x: 0, y: 0, width: imageWidth, height: sourceEdge, dx: 0, dy: 0, dw: width, dh: edge },
    { x: 0, y: imageHeight - sourceEdge, width: imageWidth, height: sourceEdge, dx: 0, dy: height - edge, dw: width, dh: edge },
  ];
}

export function paintBackground(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, fit: BackgroundFit = "cover") {
  const slices = backgroundSlices(image.naturalWidth, image.naturalHeight, width, height, fit);
  if (slices.length === 1) {
    const slice = slices[0];
    context.drawImage(image, slice.x, slice.y, slice.width, slice.height, slice.dx, slice.dy, slice.dw, slice.dh);
    return;
  }
  // Sampling a single colour directly avoids pixel readback/CORS restrictions.
  context.drawImage(image, Math.floor(image.naturalWidth / 2), Math.floor(image.naturalHeight / 2), 1, 1, 0, 0, width, height);
  for (const [index, slice] of slices.entries()) {
    const surface = context.canvas.ownerDocument.createElement("canvas");
    surface.width = Math.ceil(slice.dw);
    surface.height = Math.ceil(slice.dh);
    const edgeContext = surface.getContext("2d");
    if (!edgeContext) continue;
    edgeContext.drawImage(image, slice.x, slice.y, slice.width, slice.height, 0, 0, surface.width, surface.height);
    const fade = edgeContext.createLinearGradient(0, 0, 0, surface.height);
    if (index === 0) {
      fade.addColorStop(0, "#000");
      fade.addColorStop(.55, "#000");
      fade.addColorStop(1, "transparent");
    } else {
      fade.addColorStop(0, "transparent");
      fade.addColorStop(.45, "#000");
      fade.addColorStop(1, "#000");
    }
    edgeContext.globalCompositeOperation = "destination-in";
    edgeContext.fillStyle = fade;
    edgeContext.fillRect(0, 0, surface.width, surface.height);
    context.drawImage(surface, slice.dx, slice.dy, slice.dw, slice.dh);
  }
}

// Match the fallback image's object-fit in the animated texture.
export function backgroundCrop(imageWidth: number, imageHeight: number, width: number, height: number, fit: BackgroundFit = "cover") {
  if (fit === "fill") {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  return {
    x: (imageWidth - cropWidth) / 2,
    y: (imageHeight - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

export function backgroundTextureSize(width: number, height: number) {
  const scale = Math.min(1, 1920 / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function uncroppedBackgroundShader(shader: string) {
  // Shery style 5 adds a permanent 10% UV zoom even when motion is idle.
  return shader.replace(/vec2\s+uv\s*=\s*\(vuv\s*\/\s*1\.1\)\s*\+\s*\.05\s*;/, "vec2 uv=vuv;");
}
