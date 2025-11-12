import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import showVid  from"./assets/showreel.mp4";
/**
 * EVA — Documentary Portfolio (React + Tailwind + Framer Motion)
 * -------------------------------------------------
 * - Filmic chaptered scroll home with a quiet showreel
 * - Scroll-reveal + micro parallax + soft hover animations
 * - Project detail pages with hover captions + lightbox
 * - About page with timeline
 *
 * Notes:
 * 1) Install framer-motion:  npm install framer-motion
 * 2) Replace Unsplash placeholders with real images
 */

/******************** DATA **************************/
const projects = [
  {
    id: "ukraine",
    title: "Ukraine",
    place: "Bene, Ukraine / Hungary",
    year: "Ongoing",
    logline: "A refugee family’s ordinary life between scarcity and care.",
    description:
      "Eva met this family in Bene while working on an assignment about Ukrainian refugees. There are five children, a mother and a grandmother. The mother is the breadwinner; they barely make ends meet. Bea, the eldest daughter, planned to work in Germany but became pregnant. Her mother is handicapped after a stroke and hip fracture. This story continues.",
    images: [
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/MG_3071-scaled.jpg", caption: "Domestic scene, Bene" },
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/MG_3053-scaled.jpg", caption: "Children at play" },
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/MG_3085-scaled.jpg", caption: "Kitchen light" },
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/MG_3042-scaled.jpg", caption: "Evening meal" }
    ]
  },
  {
    id: "swallow-song",
    title: "Swallow Song",
    place: "Bokortanya, Nyíregyháza, Hungary",
    year: "Ongoing",
    logline: "Life and memory in the hamlets around Nyíregyháza.",
    description:
      "Bokortanya settlements were formed from 1753 as outlying farm hamlets for Nyíregyháza—once the town’s pantry. They declined during the 1950s under communist centralisation. After her grandmother, who lived in one of these settlements, passed away, Eva began exploring and photographing those who remain.",
    images: [
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/MG_7894.jpg", caption: "Morning in Bokortanya" },
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/Bokor_02.jpg", caption: "Old stable" },
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/Bokor_03.jpg", caption: "Portrait of resident" }
    ]
  },
  {
    id: "jordan",
    title: "Jordan",
    place: "Amman, Jordan",
    year: "Ongoing",
    logline: "Women adapting to new lives amid displacement.",
    description:
      "A collaboration with International Medical Corps and the International Rescue Committee. Eva travelled to Jordan to meet Syrian and Palestinian refugees in camps, households, and hospitals, focusing on how women adapt to their new environment.",
    images: [
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/Jordan_02.jpg", caption: "Mother and child" },
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/Jordan_03.jpg", caption: "Apartment window" },
      { src: "https://evaaszabo.com/wp-content/uploads/2024/02/Jordan_04.jpg", caption: "Community clinic" }
    ]
  }
];


const brand = {
  name: "Eva Szabo",
  tag: "documentary photographer",
};

/******************** UTILS **************************/
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

/******************** LIGHTBOX **************************/
function Lightbox({ open, src, caption, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.figure
        className="max-w-6xl w-full relative"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <img src={src} alt={caption || "Image"} className="w-full h-auto object-contain rounded" />
        {caption && (
          <figcaption className="text-sm text-zinc-300 mt-3 leading-relaxed">{caption}</figcaption>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </motion.figure>
    </motion.div>
  );
}

/******************** NAV **************************/
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      className={classNames(
        "fixed top-0 left-0 right-0 z-40 transition backdrop-blur",
        scrolled ? "bg-[#F7F4EF]/80 border-b border-zinc-200" : "bg-transparent"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-tight text-zinc-900">
          {brand.name}
        </Link>
        <nav className="text-sm text-zinc-700 flex items-center gap-5">
          <Link className="hover:opacity-70" to="/">Work</Link>
          <Link className="hover:opacity-70" to="/about">About</Link>
        </nav>
      </div>
    </motion.header>
  );
}

/******************** HOME — Showreel + Chapters **************************/
function useMouseParallax(strength = 10) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setOffset({ x: -dx * strength, y: -dy * strength });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [strength]);
  return { ref, offset };
}

function ShowreelVideo({ src }) {
  const { ref, offset } = useMouseParallax(10);

  return (
    <section
      ref={ref}
      className="relative h-[85vh] min-h-[660px] w-full overflow-hidden bg-zinc"
    >
      <video
        src= {showVid}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-98 mt-12"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: "transform 0.1s ease-out",
        }}
      />

      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#F7F4EF] via-transparent to-transparent" />

      {/* caption */}
      <motion.div
        className="absolute bottom-1  left-8 md:left-16 text-zinc-100 drop-shadow-lg"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 0.5 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <p className="font-serif-light text-1xl md:text-3xl text-[#111] leading-snug max-w-xl">
          Eva — documentary photographer connecting memory, loss, and place.
        </p>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-zinc-200"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        Scroll
      </motion.div>
    </section>
  );
}


const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ChapterCard({ project, index }) {
  const cover = project.images?.[0]?.src;
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
      <Link to={`/project/${project.id}`} className="group grid md:grid-cols-7 gap-6 items-center">
        <div className="md:col-span-4 overflow-hidden rounded-2xl shadow-sm">
          <motion.img
            src={cover}
            alt={project.title}
            className="w-full h-[42vh] object-cover"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
        <div className="md:col-span-3">
          <h3 className="font-serif text-2xl text-zinc-900">{project.title}</h3>
          <p className="text-sm text-zinc-600 mt-1">{project.place} · {project.year}</p>
          <p className="text-zinc-800 mt-3 leading-relaxed">{project.logline}</p>
          <p className="text-zinc-500 mt-3 text-sm">Click to open project →</p>
        </div>
      </Link>
    </motion.div>
  );
}

function Home() {
  const frames = useMemo(() => {
    const seed = projects.flatMap(p => p.images.slice(0, 2));
    return seed.length ? seed : [{ src: "https://images.unsplash.com/photo-1529676468690-dad9e0d4ea28?q=80&w=1600&auto=format&fit=crop" }];
  }, []);

  return (
    <main className="bg-[#F7F4EF] min-h-screen text-[#111]">
      <ShowreelVideo frames={frames} />

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <motion.div className="mb-10" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="font-serif text-3xl md:text-4xl">Projects</h2>
          <p className="text-zinc-700 mt-2 max-w-2xl">Three bodies of work that anchor Eva’s practice.</p>
        </motion.div>
        <div className="space-y-14">
          {projects.map((p, idx) => (
            <ChapterCard key={p.id} project={p} index={idx} />
          ))}
        </div>
      </section>

      <section id="book" className="mx-auto max-w-6xl px-4 py-16 border-t border-zinc-200">
        <motion.div className="grid md:grid-cols-5 gap-8 items-center" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="md:col-span-3">
            <h3 className="font-serif text-2xl md:text-3xl">Book (in progress)</h3>
            <p className="text-zinc-700 mt-3 max-w-xl">
              A small-tealights length book drawn from <em>Grandmother's Village</em> and <em>Ukraine</em>. Early dummies available on request.
            </p>
          </div>
          <div className="md:col-span-2">
            <motion.div className="aspect-[3/2] rounded-xl overflow-hidden bg-zinc-200" whileHover={{ scale: 1.01 }}>
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1600&auto=format&fit=crop" alt="Book mock spread" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}

/******************** PROJECT PAGE **************************/
function ProjectPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const projectIndex = projects.findIndex((p) => p.id === id);
  const project = projects[projectIndex] || projects[0];

  const [lightbox, setLightbox] = useState({ open: false, src: "", caption: "" });

  return (
    <main className="bg-[#F7F4EF] min-h-screen text-[#111]">
      <motion.section className="mx-auto max-w-5xl px-4 pt-28 pb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => nav(-1)} className="text-sm text-zinc-600 hover:text-zinc-900">← Back</button>
        <h1 className="font-serif text-3xl md:text-4xl mt-3">{project.title}</h1>
        <p className="text-zinc-600 mt-1">{project.place} · {project.year}</p>
        <p className="text-zinc-800 mt-5 max-w-3xl leading-relaxed">{project.description}</p>
      </motion.section>

      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {project.images.map((img, idx) => (
            <motion.figure
              key={idx}
              className="relative overflow-hidden rounded-xl group cursor-zoom-in"
              whileHover={{ y: -2 }}
              onClick={() => setLightbox({ open: true, src: img.src, caption: img.caption })}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4 }}
            >
              <img src={img.src} alt={img.caption || `${project.title} image ${idx+1}`} className="w-full h-72 object-cover will-change-transform" />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-3 translate-y-full group-hover:translate-y-0 transition">
                {img.caption || project.logline}
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="flex items-center justify-between mt-12 text-sm text-zinc-700">
          <button
            disabled={projectIndex <= 0}
            onClick={() => nav(`/project/${projects[Math.max(0, projectIndex - 1)].id}`)}
            className={classNames(
              "px-3 py-2 rounded hover:bg-zinc-200/60",
              projectIndex <= 0 && "opacity-40 cursor-not-allowed"
            )}
          >
            ← Previous
          </button>
          <button
            disabled={projectIndex >= projects.length - 1}
            onClick={() => nav(`/project/${projects[Math.min(projects.length - 1, projectIndex + 1)].id}`)}
            className={classNames(
              "px-3 py-2 rounded hover:bg-zinc-200/60",
              projectIndex >= projects.length - 1 && "opacity-40 cursor-not-allowed"
            )}
          >
            Next →
          </button>
        </div>
      </section>

      <AnimatePresence>
        {lightbox.open && (
          <Lightbox {...lightbox} onClose={() => setLightbox({ open: false, src: "", caption: "" })} />
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

/******************** ABOUT **************************/
function About() {
  return (
    <main className="bg-[#F7F4EF] min-h-screen text-[#111]">
      <section className="mx-auto max-w-4xl px-4 pt-28 pb-20">
        <motion.h1 className="font-serif text-3xl md:text-4xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>About Eva</motion.h1>
        <motion.p className="text-zinc-700 mt-4 leading-relaxed max-w-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          Eva left university to follow the camera her mother carried. Her first sustained project began in her grandmother's village, where stories were told in kitchens and courtyards. Since then, she has photographed communities with patience and care, focusing on the emotional threads that bind places and people.
        </motion.p>
        <div className="mt-10 grid gap-6">
          {[{y:"2019",t:"Leaves university; begins Grandmother's Village."},{y:"2022",t:"Photographs in Kyiv and Odessa, focusing on ordinary life between sirens."},{y:"2025",t:"Book dummy in progress. Select assignments for newspapers; occasional food photography for restaurants."}].map((row,i)=> (
            <motion.div key={i} className="flex gap-4" initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true }}>
              <span className="text-xs uppercase tracking-wider text-zinc-500 w-28">{row.y}</span>
              <p className="text-zinc-800">{row.t}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

/******************** FOOTER **************************/
function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Eva — Documentary Photography</p>
        <div className="flex gap-5">
          <a className="hover:opacity-70" href="#">Instagram</a>
          <a className="hover:opacity-70" href="#">Email</a>
        </div>
      </div>
    </footer>
  );
}

/******************** APP **************************/
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F7F4EF] text-[#111111] selection:bg-[#BCA98A] selection:text-[#111]">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
