import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import FundingMap from "./components/FundingMap";
import mainBackground from "./assets/main-background.png";
import placeholderLoan from "./assets/placeholder-loan.jpg";
import placeholderTraining from "./assets/placeholder-training.jpg";
import placeholderIndependence from "./assets/placeholder-independence.jpg";
import placeholderStory from "./assets/placeholder.jpg";

const impactStats = [
  {
    value: "575,000+",
    label: "Women Supported",
    detail:
      "Capital and mentorship helping women launch resilient small businesses.",
  },
  {
    value: "90%",
    label: "Repayment Rate",
    detail:
      "Community-led trust circles keep repayment strong and sustainable.",
  },
];

const journeySteps = [
  {
    title: "1. The Loan",
    copy: "A practical micro-loan gives women working capital for inventory, tools, and first growth steps.",
    image: placeholderLoan,
  },
  {
    title: "2. The Training",
    copy: "Hands-on coaching covers bookkeeping, pricing, and business planning for long-term confidence.",
    image: placeholderTraining,
  },
  {
    title: "3. The Independence",
    copy: "Profitable businesses create family stability, local jobs, and a path out of generational poverty.",
    image: placeholderIndependence,
  },
];

const keyPartners = [
  {
    name: "Whole Foods Market Foundation",
    description:
      "Supports financial inclusion and women-led enterprise development.",
    logo: "https://www.google.com/s2/favicons?domain=wholefoodsmarket.com&sz=128",
  },
  {
    name: "Symbiotics",
    description: "A leading market access platform for impact investing.",
    logo: "https://www.google.com/s2/favicons?domain=symbioticsgroup.com&sz=128",
  },
  {
    name: "Global Partnerships",
    description: "An impact-first investment fund manager.",
    logo: "https://www.google.com/s2/favicons?domain=globalpartnerships.org&sz=128",
  },
  {
    name: "Grameen Credit Agricole",
    description:
      "Contributes to the fight against poverty through microcredit and equity investments.",
    logo: "https://www.google.com/s2/favicons?domain=gca-fund.com&sz=128",
  },
  {
    name: "ADA",
    description: "A Luxembourgish NGO supporting microfinance institutions.",
    logo: "https://www.google.com/s2/favicons?domain=ada-microfinance.lu&sz=128",
  },
  {
    name: "WE4F",
    description:
      "Joint initiative helping design ESG-compliant loans for female smallholder farmers.",
    logo: "https://www.google.com/s2/favicons?domain=we4f.org&sz=128",
  },
  {
    name: "Oikocredit",
    description: "A social impact investor focused on financial inclusion.",
    logo: "https://www.google.com/s2/favicons?domain=oikocredit.coop&sz=128",
  },
  {
    name: "The Headley Trust",
    description:
      "Part of the Sainsbury Family Charitable Trusts supporting agricultural programs.",
    logo: "https://www.google.com/s2/favicons?domain=sainsburyfamilycharitabletrusts.org.uk&sz=128",
  },
  {
    name: "Women's Digital Financial Inclusion Advocacy Hub",
    description:
      "Led by Women's World Banking and the UNCDF to expand inclusive digital finance.",
    logo: "https://www.google.com/s2/favicons?domain=womensworldbanking.org&sz=128",
  },
];

const newsAndBlogPosts = [
  {
    title:
      "Beyond the Loan: Why lasting change takes more than access to finance",
    snippet:
      "People hear microfinance and think of one thing: a small loan. The loan is the least of it.",
  },
  {
    title: "Microfinance under fire - and why the reality is more complex",
    snippet:
      "Recent criticism of microfinance deserves an honest answer rather than a defensive one.",
  },
  {
    title: "Improved donation system to be implemented",
    snippet:
      "We are moving to a new donation processing system so that more of every gift reaches the field.",
  },
  {
    title: "Matched funding | Double your impact today through matched giving",
    snippet:
      "Matched giving doubles every pound for a limited window. Here is where it goes.",
  },
  {
    title: "The Quiet Revolution: Women's Financial Empowerment in Action",
    snippet:
      "A perspective on how local enterprise and long-term support are unlocking sustainable progress for women-led households.",
  },
  {
    title: "Invest in a woman. Transform a generation.",
    snippet:
      "Across Malawi, Zambia, Zimbabwe and South Africa, women are meeting a deepening food and income crisis.",
  },
];

const empoweredWomenStories = [
  {
    name: "Breaking the Cycle: Lydia's Story",
    summary:
      "International Women’s Day celebrates what women achieve. Lydia’s story is about what it took to get there.",
  },
  {
    name: "Lavick's Story",
    summary:
      "MicroLoan improved my business. It has helped me cover my children’s school fees, and I have started saving.",
  },
  {
    name: "Closing the gap: Invest in women who are building the future",
    summary:
      "Roselinah Motloung once struggled to feed her family. She now runs a business that supports all six of them.",
  },
];

function ActionButton({ children, variant, onPress }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.55;
    const nextRipple = {
      id: crypto.randomUUID(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      size,
    };

    setRipples((prev) => [...prev, nextRipple]);
    window.setTimeout(() => {
      setRipples((prev) =>
        prev.filter((ripple) => ripple.id !== nextRipple.id),
      );
    }, 650);

    if (onPress) {
      onPress();
    }
  };

  const baseClass =
    "ripple-btn inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold tracking-tight transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

  const variantClass =
    variant === "accent"
      ? "bg-[var(--accent)] text-white shadow-[0_16px_40px_rgba(0,168,163,0.35)] hover:bg-[var(--accent-strong)] hover:-translate-y-0.5"
      : "border border-[var(--line)] bg-[var(--glass)] text-white backdrop-blur-xl hover:bg-white/28 hover:-translate-y-0.5";

  const rippleColor =
    variant === "accent" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.5)";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClass} ${variantClass}`}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            background: rippleColor,
          }}
        />
      ))}
    </button>
  );
}

function App() {
  const heroRef = useRef(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroTranslate = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroFade = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  const fadeUp = {
    initial: { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  };

  const handleFakeLogin = (event) => {
    event.preventDefault();
    setShowLoginHint(true);
  };

  return (
    <main className="overflow-x-clip">
      <section ref={heroRef} className="relative min-h-[100svh] w-full">
        <img
          src={mainBackground}
          alt="Women entrepreneurs"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--hero-overlay)" }}
        />
        <div className="grain" />

        <motion.div
          style={{ y: heroTranslate, opacity: heroFade }}
          className="shell relative z-10 flex h-full flex-col justify-center pb-12 pt-28 text-white"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-5 max-w-lg text-sm font-semibold uppercase tracking-[0.2em] text-white/75"
          >
            MicroLoan Foundation UK
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.22 }}
            className="font-display display-xl font-semibold tracking-[-0.03em] text-white"
          >
            Empowering Women.
            <br />
            Eradicating Poverty.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.33 }}
            className="mt-8 max-w-2xl text-base leading-relaxed text-white/82 sm:text-lg md:text-xl"
          >
            Provide small loans and business training to women in sub-Saharan
            Africa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <ActionButton variant="accent">Donate Now</ActionButton>
            <ActionButton variant="glass" onPress={() => setIsLoginOpen(true)}>
              Log In
            </ActionButton>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative border-t border-rule bg-paper py-24">
        <div className="shell">
        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="font-display display-lg font-semibold tracking-[-0.02em] text-ink"
        >
          Small loans, repaid and lent again
        </motion.h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <p className="measure text-lg leading-relaxed text-ink/70">
            A loan of around £80 buys stock, tools or seed. It is repaid over
            a year into a local fund and lent again to the next woman in the
            group, so the same capital keeps working long after the first
            business is standing.
          </p>

          <dl className="divide-y divide-rule border-y border-rule">
            {impactStats.map((stat) => (
              <div key={stat.label} className="py-6 first:pt-0 last:pb-0">
                <dt className="font-display text-[clamp(2.25rem,3.2vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-ink">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-base font-bold text-ink">
                  {stat.label}
                </dd>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink/65">
                  {stat.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        </div>
      </section>

      <FundingMap />

      <section className="relative border-t border-rule bg-paper py-24">
        <div className="shell">
        <motion.h3
          {...fadeUp}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="font-display display-lg font-semibold tracking-[-0.02em] text-ink"
        >
          Who we build with
        </motion.h3>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {keyPartners.map((partner, index) => (
            <motion.article
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.75,
                delay: 0.04 * index,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl border border-white/55 bg-white/70 p-5 shadow-glass backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  loading="lazy"
                  className="h-10 w-10 rounded-xl border border-slate-200/70 bg-white object-contain p-1.5"
                />
                <p className="text-sm font-semibold leading-snug text-slate-800">
                  {partner.name}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {partner.description}
              </p>
            </motion.article>
          ))}
        </div>
        </div>
      </section>

      <section className="relative border-t border-rule bg-paper-deep py-24">
        <div className="shell">
        <motion.h4
          {...fadeUp}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="font-display display-lg font-semibold tracking-[-0.02em] text-ink"
        >
          Latest thinking, campaigns and updates
        </motion.h4>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {newsAndBlogPosts.map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.75,
                delay: 0.05 * index,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-glass backdrop-blur-xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Post {index + 1}
              </p>
              <h5 className="font-display mt-3 text-xl font-semibold leading-tight tracking-[-0.02em] text-slate-900">
                {post.title}
              </h5>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {post.snippet}
              </p>
            </motion.article>
          ))}
        </div>
        </div>
      </section>

      {/* Split panel: the photograph is never tinted, so skin tones stay
          true. Text lives entirely on the solid plum side. */}
      <section className="relative isolate bg-brand-deep text-white">
        <div className="grid lg:grid-cols-[42%_58%]">
          <div className="relative z-10 order-2 flex items-center px-6 py-20 lg:order-1 lg:py-28 lg:pl-[max(1.5rem,calc((100vw-1440px)/2+clamp(1.5rem,4vw,4rem)))] lg:pr-14">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                Empowered Women
              </p>
              <h4 className="font-display display-lg mt-4 font-semibold tracking-[-0.02em]">
                She repaid the loan in eleven months. Then she hired her
                neighbour.
              </h4>
              <p className="measure mt-6 text-base leading-relaxed text-white/75">
                Every loan is repaid into a local fund and lent again. Three
                women, in their own words, below.
              </p>
            </div>
          </div>

          <div className="relative order-1 min-h-[18rem] lg:order-2 lg:min-h-0">
            <img
              src={placeholderStory}
              alt="Members of a MicroLoan Foundation trust group"
              className="h-full w-full object-cover object-top"
            />
            {/* narrow seam only, so the image itself stays untouched */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 hidden w-[120px] lg:block"
              style={{
                background:
                  "linear-gradient(90deg, #2f1430 0%, rgba(47,20,48,0) 100%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* the cards were unreadable over the photograph — they sit on paper */}
      <section className="relative border-t border-rule bg-paper py-24">
        <div className="shell">
          <div className="grid gap-6 md:grid-cols-3">
            {empoweredWomenStories.map((story) => (
              <article
                key={story.name}
                className="rounded-lg border border-rule bg-white p-6"
              >
                <h5 className="font-display text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">
                  {story.name}
                </h5>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {story.summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-rule bg-paper py-24">
        <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/65 bg-white/80 p-7 shadow-glass backdrop-blur-xl sm:p-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Newsletter Signup
          </p>
          <h4 className="font-display mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">
            Stay connected to new stories and campaigns.
          </h4>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Get updates on impact milestones, fundraising campaigns, and
            opportunities to support women entrepreneurs.
          </p>

          <form
            className="mt-7 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="submit"
              className="ripple-btn rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
        </div>
      </section>

      <section className="relative border-t border-rule bg-paper-deep py-24">
        <div className="shell">
        <div className="min-h-[255vh] rounded-[2.2rem] bg-slate-950/96 px-6 py-14 text-white sm:px-10 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.85fr)_1.15fr]">
            <div className="lg:sticky lg:top-20 lg:h-fit">
              <motion.p
                {...fadeUp}
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand"
              >
                How It Works
              </motion.p>
              <motion.h3
                {...fadeUp}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.06,
                }}
                className="font-display mt-4 text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-slate-900 sm:text-5xl"
              >
                The MicroLoan Journey
              </motion.h3>
              <motion.p
                {...fadeUp}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.12,
                }}
                className="mt-6 max-w-sm text-base leading-relaxed text-slate-900"
              >
                The left story stays anchored while each transformation step
                flows past it.
              </motion.p>
            </div>

            <div>
              {journeySteps.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0.12, y: 74 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.45 }}
                  transition={{
                    duration: 0.86,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mb-20 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-glass backdrop-blur-xl sm:p-8"
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    className="h-[300px] w-full rounded-2xl object-cover shadow-[0_28px_70px_rgba(0,0,0,0.35)] sm:h-[360px] lg:h-[420px]"
                  />
                  <h4 className="font-display mt-7 text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">
                    {step.title}
                  </h4>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
                    {step.copy}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      <AnimatePresence>
        {isLoginOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 28, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-7 shadow-[0_30px_90px_rgba(3,7,18,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Demo Log In
                  </p>
                  <h4 className="font-display mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                    Welcome back
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginOpen(false);
                    setShowLoginHint(false);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              <form className="mt-6 space-y-3" onSubmit={handleFakeLogin}>
                <label htmlFor="demo-email" className="sr-only">
                  Email
                </label>
                <input
                  id="demo-email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <label htmlFor="demo-password" className="sr-only">
                  Password
                </label>
                <input
                  id="demo-password"
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="submit"
                  className="ripple-btn mt-1 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Log In
                </button>
              </form>

              <p className="mt-4 text-sm text-slate-500">
                Demo only. This login does not connect to any backend service.
              </p>
              {showLoginHint ? (
                <p className="mt-2 text-sm font-medium text-emerald-700">
                  Looks good. In production this would authenticate securely.
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="relative border-t border-rule bg-paper py-24">
        <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2.25rem] border border-white/60 bg-white/70 px-8 py-16 shadow-glass backdrop-blur-xl"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            Final Call
          </p>
          <h5 className="font-display mt-5 text-4xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-6xl">
            Make an Impact Today
          </h5>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Every contribution helps fund a woman entrepreneur, strengthen a
            family, and uplift an entire community.
          </p>
          <div className="mt-9 flex items-center justify-center">
            <button
              type="button"
              className="ripple-btn rounded-full bg-slate-900 px-9 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Donate
            </button>
          </div>
        </motion.div>

        <footer className="mt-10 border-t border-slate-300/70 pt-8 text-sm text-slate-500">
          MicroLoan Foundation UK · Presentation Concept · Built for judging
          panel showcase
        </footer>
        </div>
      </section>
    </main>
  );
}

export default App;
