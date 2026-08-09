import type { Metadata } from "next";
import Image from "next/image";
import { SITE } from "@/content/site";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Prose from "@/components/ui/Prose";
import Card from "@/components/ui/Card";
import Rule from "@/components/motion/Rule";

export const metadata: Metadata = {
  title: "About",
  description:
    "Priya Swaroop Tripathi, Numero-Vastu consultant. From a childhood fascination with Cheiro's Book of Numbers to a practice serving clients across the globe.",
};

/**
 * Her own account, recovered from the 2021 site's index.php and lightly edited
 * for grammar and length. The voice is deliberately kept — it is first-person
 * and personal, and smoothing it into marketing copy would lose the thing that
 * makes it persuasive.
 */
const STORY = [
  "I am a simple person from a small town. I did my Masters in Human Resource and Public Administration, and worked with several corporates and MNCs until I realised it was not what I wanted to do.",
  "Since early childhood I had a keen interest in tarot and numerology. I remember reading Cheiro's Book of Numbers at around fourteen, and connecting with it on another level entirely. It was describing me. My habits, my likes, my dislikes. I was astonished that it could be so accurate, and I read everything there was about a number 3 person. It was exactly me.",
  "As a child I lived in a world of my own where I believed I knew what was going to happen next. It may sound childish now, but at the time it was simply the truth of my life, and when I said something about someone and it came true, it frightened me.",
  "Then one evening we were invited to dinner at a friend's house, and I saw a deck of tarot cards. Her aunt was a reader. Everyone was asking questions, and I just watched: one question after another, she drew the cards and narrated the sequence of events, past, present and future. That was the day I connected with tarot properly. I knew this was what I wanted to do.",
  "I have been a meditative person all my life, and my intuitions have always guided my decisions, enough that people much older than me came to me for advice. At sixteen I founded a meditation institute in my town, running under the name Life and Meditation, by Pandit Ravi Sharma.",
  "For years I read and learned about numbers and cards without ever studying them formally. Then, a few years ago, I came back to tarot and took a professional course to understand every detail of it. One thing led to another and I gave myself over to this world completely, completing my Master's and Grand Master in Numerology, Tarot Reading, Vastu Shastra, Relationship Fitness, Chakra Healing and Dowsing.",
  "It feels like a lifetime now. I have clients across the globe, and this work lets me meet and help people from every walk of life. I have worked with individuals and business owners on health, wealth, work, career, illness, marriage and material success. I advise with sincerity and honesty, and I keep the solutions simple and easy to follow, whatever your faith.",
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <Eyebrow>About</Eyebrow>
        <Rule className="mt-4" />

        <Heading as="h1" className="mt-6">
          {SITE.practitioner.name}
        </Heading>
        <p className="font-inter text-astral-gold/70 mt-3 text-sm tracking-[0.2em] uppercase">
          {SITE.practitioner.title}
        </p>

        {/*
          Framed, unlike the homepage portrait: this photograph is opaque, so
          it needs an edge. Its top is already near-black and blends into the
          page on its own; the scrim below only has to deal with the blurred
          audience along the bottom, which would otherwise stop on a hard line.

          Floated so the story wraps around it rather than being pushed below —
          seven paragraphs beside a lone image reads as two columns that have
          lost each other.
        */}
        <figure className="mt-10 mb-6 md:float-right md:mt-0 md:mb-4 md:ml-10 md:w-[380px]">
          <div className="surface-astral relative overflow-hidden">
            <Image
              src="/priya-speaking.webp"
              alt={`${SITE.practitioner.name} speaking at a session`}
              width={797}
              height={796}
              sizes="(max-width: 768px) 100vw, 380px"
              className="h-auto w-full"
            />
            <div
              aria-hidden
              className="from-void-black/70 pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent"
            />
          </div>
        </figure>

        <Prose paragraphs={STORY} className="mt-10" />
        <div className="clear-both" />
      </Section>

      <Section tone="ethereal" className="!pt-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="font-cinzel text-astral-gold text-lg">Vision</h2>
            <p className="font-inter text-parchment-white/70 mt-3 leading-relaxed text-pretty">
              {SITE.vision}
            </p>
          </Card>
          <Card>
            <h2 className="font-cinzel text-astral-gold text-lg">Mission</h2>
            <p className="font-inter text-parchment-white/70 mt-3 leading-relaxed text-pretty">
              {SITE.mission}
            </p>
          </Card>
        </div>

        <div className="mt-10">
          <h2 className="font-cinzel text-parchment-white text-lg">
            Areas of study
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SITE.practitioner.credentials.map((c) => (
              <li
                key={c}
                className="border-astral-gold/30 text-astral-gold/85 font-inter rounded-full border px-3 py-1 text-xs tracking-wide"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="!pt-16 text-center">
        <Heading as="h2" reveal>
          Work with me
        </Heading>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/contact">Get in touch</Button>
          <Button href="/services" variant="ghost">
            See the services
          </Button>
        </div>
      </Section>
    </>
  );
}
