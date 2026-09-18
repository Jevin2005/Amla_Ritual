// Match object-fit: cover and object-position: center in the animated texture.
export function backgroundCrop(imageWidth: number, imageHeight: number, width: number, height: number) {
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
