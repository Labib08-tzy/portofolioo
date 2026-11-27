import { useEffect, useMemo, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { GALLERY_PHOTOS, type GalleryPhoto } from "../../data/galleryPhotos";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BlurBackdrop } from "../ui/BlurBackdrop";
import "../../styles/portal.css";
import { baseFor, buildSlots, camEnd, frameAt, type Base } from "./flightMath";
import { lightImage } from "./lightImage";

/** Di HP foto dibatasi supaya ringan. */
const MOBILE_MAX_PHOTOS = 8;
const ALL_SLOTS = buildSlots(GALLERY_PHOTOS.length);

/** Kartu foto: sudut membulat, tepi kaca, bayangan lembut (tanpa kotak keras). */
function PhotoCard({
  photo,
  armed = true,
  tone = "light",
}: {
  photo: GalleryPhoto;
  armed?: boolean;
  tone?: "light" | "dark";
}) {
  const [failed, setFailed] = useState(false);
  const [url, setUrl] = useState<string>();

  // Foto diperkecil dulu (maks 1000px) supaya ringan di GPU
  useEffect(() => {
    if (!armed) return;
    let alive = true;
    lightImage(photo.src).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [armed, photo.src]);

  const shell =
    tone === "light"
      ? "border-ink/10 bg-white/50 shadow-[0_14px_30px_-18px_rgb(11_15_13/0.5)] md:shadow-[0_22px_48px_-26px_rgb(11_15_13/0.5)]"
      : "border-sand/20 bg-forest-900/60 shadow-[0_32px_80px_-28px_rgb(0_0_0/0.85)]";
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[1.75rem] border ${shell}`}>
      {failed || !url ? (
        <div
          aria-hidden="true"
          className="h-full w-full bg-[radial-gradient(circle_at_30%_25%,color-mix(in_srgb,var(--c-sage)_55%,transparent),transparent_60%),radial-gradient(circle_at_75%_80%,color-mix(in_srgb,var(--c-brass)_45%,transparent),transparent_60%)]"
        />
      ) : (
        <img
          src={url}
          alt={photo.alt}
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function Flight() {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bases = useRef<Base[]>([]);
  const shown = useRef<boolean[]>([]);
  const lastOpacity = useRef<string[]>([]);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [armed, setArmed] = useState(false);

  const count = isMobile ? Math.min(MOBILE_MAX_PHOTOS, GALLERY_PHOTOS.length) : GALLERY_PHOTOS.length;
  const slots = useMemo(() => buildSlots(count), [count]);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const camMax = useMemo(() => camEnd(slots), [slots]);
  const camMaxRef = useRef(camMax);
  camMaxRef.current = camMax;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.45 });
  const cam = useTransform(progress, [0, 1], [0, camMax]);

  /*
   * Gerak foto ditulis langsung ke DOM (tanpa React dan tanpa filter blur) supaya ringan:
   * satu putaran per frame, hanya transform + opacity yang diubah (jalur GPU).
   */
  const apply = (c: number) => {
    const list = slotsRef.current;
    // Latar (kontur) sedikit membesar saat kamera maju: terasa bergerak menembus ruang
    const world = worldRef.current;
    if (world) world.style.transform = `scale(${(1 + 0.3 * Math.min(1, c / camMaxRef.current)).toFixed(3)})`;
    for (let i = 0; i < list.length; i++) {
      const el = itemRefs.current[i];
      const b = bases.current[i];
      if (!el || !b) continue;
      const f = frameAt(list[i], c);
      if (f.opacity < 0.01) {
        if (shown.current[i] !== false) {
          el.style.visibility = "hidden";
          shown.current[i] = false;
        }
        continue;
      }
      if (shown.current[i] !== true) {
        el.style.visibility = "visible";
        shown.current[i] = true;
      }
      const op = f.opacity.toFixed(2);
      if (lastOpacity.current[i] !== op) {
        el.style.opacity = op;
        lastOpacity.current[i] = op;
      }
      el.style.transform =
        `translate3d(calc(-50% + ${(b.bx * f.inv).toFixed(1)}px), calc(-50% + ${(b.by * f.inv).toFixed(1)}px), 0) ` +
        `rotate(${list[i].rotate}deg) scale(${f.inv.toFixed(3)})`;
    }
  };
  useMotionValueEvent(cam, "change", apply);

  // Ukuran dasar foto mengikuti ukuran layar
  useEffect(() => {
    let raf = 0;
    const layout = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      slotsRef.current.forEach((slot, i) => {
        const b = baseFor(slot, vw, vh);
        bases.current[i] = b;
        const el = itemRefs.current[i];
        if (el) el.style.width = `${b.width.toFixed(1)}px`;
      });
      shown.current = [];
      lastOpacity.current = [];
      apply(cam.get());
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    };
    layout();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // apply memakai ref, jadi aman dipakai tanpa masuk dependensi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  // Muat gambar menjelang section terlihat (bukan saat halaman pertama dibuka)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "500% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      <div ref={stageRef} className="sticky top-0 isolate h-[100svh] overflow-hidden">
        {/* Latar sand bergaya blur: sama persis dengan dimensi Portofolio, jadi terasa satu ruang */}
        <div
          ref={worldRef}
          aria-hidden="true"
          className="portal-world inset-0 -z-[1]"
          style={{ willChange: "transform" }}
        />

        {slots.map((slot, i) => (
          <div
            key={GALLERY_PHOTOS[i].src}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              aspectRatio: slot.aspect,
              zIndex: slots.length - i,
              visibility: "hidden",
              willChange: "transform, opacity",
            }}
          >
            <PhotoCard photo={GALLERY_PHOTOS[i]} armed={armed} />
          </div>
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
            style={{ aspectRatio: ALL_SLOTS[i].aspect, rotate: `${ALL_SLOTS[i].rotate / 2}deg` }}
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
