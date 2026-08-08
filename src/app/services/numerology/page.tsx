import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bySlug } from "@/content/services";
import ServicePage from "@/components/service/ServicePage";

const service = bySlug("numerology");

export const metadata: Metadata = {
  title: "Numerological Study",
  description: service?.summary,
};

export default function NumerologyPage() {
  if (!service) notFound();
  return <ServicePage service={service} />;
}
