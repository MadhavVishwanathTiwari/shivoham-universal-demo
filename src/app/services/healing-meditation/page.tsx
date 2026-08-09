import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bySlug } from "@/content/services";
import ServicePage from "@/components/service/ServicePage";

const service = bySlug("healing-meditation");

export const metadata: Metadata = {
  title: "Healing & Meditation",
  description: service?.summary,
};

export default function HealingMeditationPage() {
  if (!service) notFound();
  return <ServicePage service={service} />;
}
