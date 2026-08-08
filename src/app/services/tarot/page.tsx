import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bySlug } from "@/content/services";
import ServicePage from "@/components/service/ServicePage";

const service = bySlug("tarot");

export const metadata: Metadata = {
  title: "Tarot Reading",
  description: service?.summary,
};

export default function TarotPage() {
  if (!service) notFound();
  return <ServicePage service={service} />;
}
