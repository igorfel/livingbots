import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "LivingBots — a swarm of tiny bots forming the words LIVING BOTS";

const INK = "#0B0E14";
const WORKER = "#3DD6FF";
const FOREMAN = "#FF3D6E";
const FOREMAN_RATIO = 0.08;
const DOT_COUNT = 110;

// Space Grotesk 700 (Satori needs TTF, not woff2). Fetched once at build time —
// the image is statically generated per locale, so no request-time cost.
const FONT_URL =
  "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf";
let fontData: Promise<ArrayBuffer> | null = null;
function loadFont() {
  fontData ??= fetch(FONT_URL).then((res) => res.arrayBuffer());
  return fontData;
}

/** Deterministic LCG so the scattered swarm renders identically on every build. */
function* lcg(seed: number): Generator<number> {
  let state = seed;
  while (true) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    yield state / 4294967296;
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline =
    locale === "pt"
      ? "Eu crio software que parece vivo."
      : "I build software that feels alive.";

  const rand = lcg(42);
  const dots = Array.from({ length: DOT_COUNT }, () => ({
    x: (rand.next().value as number) * size.width,
    y: (rand.next().value as number) * size.height,
    foreman: (rand.next().value as number) < FOREMAN_RATIO,
    alpha: 0.25 + (rand.next().value as number) * 0.75,
    // The swarm clears the central band where it "formed" the words.
  })).filter((dot) => dot.y < 150 || dot.y > 520);

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
          backgroundColor: INK,
          position: "relative",
        }}
      >
        {dots.map((dot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: 5,
              height: 5,
              backgroundColor: dot.foreman ? FOREMAN : WORKER,
              opacity: dot.alpha,
              boxShadow: `0 0 10px 2px ${dot.foreman ? "rgba(255,61,110,0.6)" : "rgba(61,214,255,0.5)"}`,
            }}
          />
        ))}
        <div
          style={{
            fontSize: 118,
            fontWeight: 700,
            letterSpacing: 6,
            color: WORKER,
            textShadow: "0 0 40px rgba(61,214,255,0.45)",
          }}
        >
          LIVING BOTS
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 38,
            color: "#E8ECF1",
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 24,
            color: "#7C8496",
          }}
        >
          Igor Felipe · livingbots.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: await loadFont(),
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
