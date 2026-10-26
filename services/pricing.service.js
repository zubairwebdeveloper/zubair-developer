import { seedPlans } from "@/config/content.seed";
import { COLLECTIONS } from "@/constants/collections";
import { getPublished } from "@/lib/firebase/published";

export async function getPlans() {
  return getPublished(COLLECTIONS.pricingPlans, seedPlans);
}
