import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bySlug } from "@/content/services";
import ServicePage from "@/components/service/ServicePage";

const service = bySlug("vastu");

export const metadata: Metadata = {
  title: "Vastu Consultancy",
  description: service?.summary,
};

export default function VastuPage() {
  if (!service) notFound();
  return <ServicePage service={service} />;
}
