import { redirect } from "next/navigation";
import { DEFAULT_LOCATION } from "@/hooks/mapLocations";
import { viewHref } from "@/hooks/panelRoutes";

export default function Home() {
  redirect(viewHref("map", DEFAULT_LOCATION));
}
