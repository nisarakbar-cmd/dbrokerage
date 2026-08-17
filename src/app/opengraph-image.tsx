import { ImageResponse } from "next/og";

export const alt = "dBrokerage — Islamabad & Rawalpindi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded fallback OG image, used whenever a page doesn't set its own
// openGraph.images (e.g. a listing with no photos). Satori (next/og's
// renderer) renders in an isolated context with no access to our
// globals.css custom properties, so the §3 palette values are duplicated
// here as literal hex rather than referenced as tokens.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0F1E",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
          <span style={{ color: "#1CA9E3" }}>d</span>
          <span style={{ color: "#F8FAFC" }}>Brokerage</span>
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "#94A3B8" }}>
          Controlled inventory across Islamabad &amp; Rawalpindi
        </div>
      </div>
    ),
    { ...size }
  );
}
