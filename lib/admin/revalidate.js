import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

// Next.js 16: revalidateTag ko doosra argument chahiye. { expire: 0 } = foran expire.
// Next.js 15 ma sirf revalidateTag(tag) use hota hai. Installed version ki docs check kar lein.
export function revalidateContent(collection) {
  revalidateTag(`content:${collection}`, { expire: 0 });
  revalidatePath("/", "layout");
}

export function revalidateSettings() {
  revalidateTag("settings:public", { expire: 0 });
  revalidatePath("/", "layout");
}
export function revalidateAi() {
  revalidateTag("ai:config", { expire: 0 });
  revalidatePath("/", "layout");
}