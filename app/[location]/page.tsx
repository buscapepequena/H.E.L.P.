import { notFound, redirect } from "next/navigation";
import { MAP_LOCATIONS, findLocation } from "@/hooks/mapLocations";
import { viewHref } from "@/hooks/panelRoutes";

export const instant = false;

export const generateStaticParams = () =>
  MAP_LOCATIONS.map((place) => ({ location: place.id }));

export default async function LocationPage(props: PageProps<"/[location]">) {
  const { location } = await props.params;
  const place = findLocation(location);
  if (!place) notFound();
  redirect(viewHref("map", place.id));
}
