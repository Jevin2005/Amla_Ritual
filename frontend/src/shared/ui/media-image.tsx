"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type Ref } from "react";
import { isShopifyImage, shopifyImageLoader } from "@/shared/media/image-delivery";

type Props = Omit<ImageProps, "src" | "loader"> & {
  src: string;
  fallbackSrc?: string;
  ref?: Ref<HTMLImageElement>;
};

export function MediaImage({ src, fallbackSrc, ...props }: Props) {
  return <ImageAttempt key={src} src={src} fallbackSrc={fallbackSrc} {...props} />;
}

function ImageAttempt({ src, fallbackSrc, onError, ...props }: Props) {
  const [failed, setFailed] = useState<string[]>([]);
  const sources = [...new Set([src, fallbackSrc, "/images/product-placeholder.svg"].filter((url): url is string => Boolean(url)))];
  const source = sources.find((url) => !failed.includes(`${url}:original`));
  if (!source) return <span role="img" aria-label={props.alt} className={props.className} />;
  const direct = failed.includes(source) || source.endsWith(".svg");

  return <Image key={`${source}:${direct}`} {...props} alt={props.alt} src={source}
    loader={!direct && isShopifyImage(source) ? shopifyImageLoader : undefined}
    unoptimized={direct}
    onError={(event) => {
      setFailed((previous) => [...previous, direct ? `${source}:original` : source]);
      onError?.(event);
    }} />;
}
