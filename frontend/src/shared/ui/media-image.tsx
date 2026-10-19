"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type Ref } from "react";
import { isShopifyImage, shopifyImageLoader } from "@/shared/media/image-delivery";
import styles from "./media-image.module.css";

type Props = Omit<ImageProps, "src" | "loader"> & {
  src: string;
  fallbackSrc?: string;
  ref?: Ref<HTMLImageElement>;
};

export function MediaImage({ src, fallbackSrc, ...props }: Props) {
  return <ImageAttempt key={src} src={src} fallbackSrc={fallbackSrc} {...props} />;
}

function ImageAttempt({ src, fallbackSrc, onLoad, onError, ...props }: Props) {
  const [state, setState] = useState<{ failed: string[]; loadedAttempt?: string }>({ failed: [] });
  const sources = [...new Set([src, fallbackSrc, "/images/product-placeholder.svg"].filter((url): url is string => Boolean(url)))];
  const source = sources.find((url) => !state.failed.includes(`${url}:original`));
  if (!source) return <span role="img" aria-label={props.alt} className={props.className} />;
  const direct = state.failed.includes(source) || source.endsWith(".svg");
  const attempt = `${source}:${direct}`;
  const loading = state.loadedAttempt !== attempt;

  return <Image key={attempt} {...props} alt={props.alt} src={source}
    className={loading ? [props.className, styles.loading].filter(Boolean).join(" ") : props.className}
    aria-busy={loading || undefined}
    loader={!direct && isShopifyImage(source) ? shopifyImageLoader : undefined}
    unoptimized={direct}
    onLoad={(event) => {
      // Next/Image also calls onLoad for images already cached before hydration.
      setState((previous) => ({ ...previous, loadedAttempt: attempt }));
      onLoad?.(event);
    }}
    onError={(event) => {
      setState((previous) => ({
        ...previous,
        failed: [...previous.failed, direct ? `${source}:original` : source],
      }));
      onError?.(event);
    }} />;
}
