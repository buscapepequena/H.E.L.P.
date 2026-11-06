import { notFound } from "next/navigation";
import { MAP_LOCATIONS, findLocation } from "@/hooks/mapLocations";
import { LOCATION_VIEWS, isLocationView } from "@/hooks/panelRoutes";
import PanelScreen from "@/modules/PanelScreen";

export const instant = false;

export const generateStaticParams = () =>
  MAP_LOCATIONS.flatMap((place) =>
    LOCATION_VIEWS.map((view) => ({ location: place.id, view })),
  );

export default async function LocationViewPage(
  props: PageProps<"/[location]/[view]">,
) {
  const { location, view } = await props.params;
  const place = findLocation(location);
  if (!place || !isLocationView(view)) notFound();
  return <PanelScreen view={view} locationId={place.id} />;
}
