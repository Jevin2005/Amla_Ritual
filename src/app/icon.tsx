import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#173f2a",
          color: "#f7f4e8",
          fontFamily: "Georgia",
          fontSize: 42,
          lineHeight: 1,
        }}
      >
        N
      </div>
    ),
    size,
  );
}

