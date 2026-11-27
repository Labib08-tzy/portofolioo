import { useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { GALLERY_PHOTOS, type GalleryPhoto } from "../../data/galleryPhotos";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BlurBackdrop } from "../ui/BlurBackdrop";
import "../../styles/portal.css";
import { buildSlots, camEnd, frameAt, type Slot } from "./flightMath";

const SLOTS = buildSlots(GALLERY_PHOTOS.length);
const CAM_END = camEnd(GALLERY_PHOTOS.length);

/** Kartu foto: sudut membulat, tepi kaca, bayangan lembut (tanpa kotak keras). */
function PhotoCard({
  photo,
  tone = "light",
}: {
  photo: GalleryPhoto;
  tone?: "light" | "dark";
}) {
  const [failed, setFailed] = useState(false);
  const shell =
    tone === "light"
      ? "border-ink/10 bg-white/50 shadow-[0_30px_70px_-30px_rgb(11_15_13/0.55)]"
      : "border-sand/20 bg-forest-900/60 shadow-[0_32px_80px_-28px_rgb(0_0_0/0.85)]";
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-[1.75rem] border ${shell}`}
    >
      {failed ? (
        <div
          aria-hidden="true"
          className="h-full w-full bg-[radial-gradient(circle_at_30%_25%,color-mix(in_srgb,var(--c-sage)_55%,transparent),transparent_60%),radial-gradient(circle_at_75%_80%,color-mix(in_srgb,var(--c-brass)_45%,transparent),transparent_60%)]"
        />
      ) : (
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 via-transparent to-ink/15"
      />
    </div>
  );
}

function FlightPhoto({
  slot,
  photo,
  cam,
  blurEnabled,
}: {
  slot: Slot;
  photo: GalleryPhoto;
  cam: MotionValue<number>;
  blurEnabled: boolean;
}) {
  const x = useTransform(cam, (c) => `${frameAt(slot, c).tx.toFixed(2)}vw`);
  const y = useTransform(cam, (c) => `${frameAt(slot, c).ty.toFixed(2)}vh`);
  const scale = useTransform(cam, (c) => frameAt(slot, c).scale);
  const opacity = useTransform(cam, (c) => frameAt(slot, c).opacity);
  const visibility = useTransform(cam, (c) =>
    frameAt(slot, c).opacity > 0.01 ? "visible" : "hidden"
  );
  const filter = useTransform(cam, (c) => {
    const b = frameAt(slot, c).blur;
    return blurEnabled && b > 0.3 ? `blur(${b.toFixed(1)}px)` : "none";
  });

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: SLOTS.length - slot.index }}
    >
      <motion.div
        style={{
          x,
          y,
          scale,
          opacity,
          visibility,
          filter,
          rotate: slot.rotate,
          width: `calc(var(--flight-u) * ${slot.size.toFixed(3)})`,
          aspectRatio: slot.aspect,
          willChange: "transform, opacity",
        }}
      >
        <PhotoCard photo={photo} />
      </motion.div>
    </div>
  );
}

function Flight() {
  const containerRef = useRef<HTMLElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.45,
  });
  const cam = useTransform(progress, [0, 1], [0, CAM_END]);

  return (
    <section
      ref={containerRef}
      id="gallery"
      aria-label="Galeri foto"
      className="relative"
      style={{
        height: isMobile ? "480svh" : "620svh",
        backgroundColor: "var(--c-sand)",
      }}
    >
      <div
        className="sticky top-0 isolate h-[100svh] overflow-hidden"
        style={{ "--flight-u": "max(22vmin, 16vw)" } as CSSProperties}
      >
        {/* Latar sand + garis kisi: sama persis dengan dimensi Portofolio, jadi terasa satu ruang */}
        <div aria-hidden="true" className="portal-world inset-0 -z-[1]" />

        {GALLERY_PHOTOS.map((photo, i) => (
          <FlightPhoto
            key={photo.src}
            slot={SLOTS[i]}
            photo={photo}
            cam={cam}
            blurEnabled={!isMobile}
          />
        ))}

        {/* Vignette lembut supaya foto menyatu dengan latar, bukan terpotong keras */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[60] bg-[radial-gradient(ellipse_80%_75%_at_50%_50%,transparent_55%,color-mix(in_srgb,var(--c-sand)_85%,transparent)_100%)]"
        />
      </div>
    </section>
  );
}

/** Tanpa animasi: kolase statis. */
function StaticCollage() {
  return (
    <section
      id="gallery"
      aria-label="Galeri foto"
      className="relative isolate overflow-hidden border-b border-forest-600 bg-ink px-4 py-16 sm:px-6"
    >
      <BlurBackdrop variant="b" />
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
        {GALLERY_PHOTOS.map((photo, i) => (
          <div
            key={photo.src}
            style={{ aspectRatio: SLOTS[i].aspect, rotate: `${SLOTS[i].rotate / 2}deg` }}
          >
            <PhotoCard photo={photo} tone="dark" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PhotoFlight() {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? <StaticCollage /> : <Flight />;
}
