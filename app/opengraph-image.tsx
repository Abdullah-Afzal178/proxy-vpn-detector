import { ImageResponse } from "next/og";

import { PAGE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#f8fafc",
          color: "#020617",
          padding: "56px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            border: "2px solid #cbd5e1",
            borderRadius: "32px",
            background: "#ffffff",
            padding: "48px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "760px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                color: "#0369a1",
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                marginTop: "32px",
                fontSize: "64px",
                lineHeight: 1.05,
                fontWeight: 700,
              }}
            >
              Is this IP a VPN, proxy, or Tor?
            </div>
            <div
              style={{
                marginTop: "24px",
                fontSize: "27px",
                lineHeight: 1.4,
                color: "#475569",
              }}
            >
              {PAGE_DESCRIPTION}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              border: "10px solid #0f172a",
              alignItems: "center",
              justifyContent: "center",
              background: "#e0f2fe",
              color: "#0f172a",
              fontSize: "104px",
              fontWeight: 700,
            }}
          >
            🛡
          </div>
        </div>
      </div>
    ),
    size,
  );
}
