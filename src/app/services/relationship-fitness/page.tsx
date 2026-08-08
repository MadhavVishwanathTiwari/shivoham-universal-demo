import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bySlug } from "@/content/services";
import ServicePage from "@/components/service/ServicePage";

const service = bySlug("relationship-fitness");

export const metadata: Metadata = {
  title: "Relationship Fitness",
  description: service?.summary,
};

export default function RelationshipFitnessPage() {
  if (!service) notFound();
  return <ServicePage service={service} />;
}
