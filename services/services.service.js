import { seedServices } from "@/config/content.seed";
import { getPublished } from "@/lib/firebase/published";
import { COLLECTIONS } from "@/constants/collections";

export async function getServices() {
  return getPublished(COLLECTIONS.services, seedServices);
}

export async function getServiceBySlug(slug) {
  const services = await getServices();
  return services.find((service) => service.slug === slug) ?? null;
}
