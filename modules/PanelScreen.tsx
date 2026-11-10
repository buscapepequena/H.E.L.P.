"use client";

import { findLocation } from "@/hooks/mapLocations";
import { useMusic } from "@/hooks/musicContext";
import { VIEW_SCREENS } from "@/hooks/panelButtons";
import { usePanel } from "@/hooks/panelContext";
import { PanelView } from "@/types/panel";
import DownloadScreen from "@/modules/DownloadScreen";
import MapScreen from "@/modules/MapScreen";
import MapView from "@/modules/MapView";
import Mp3Player from "@/modules/Mp3Player";
import RoomsGrid from "@/modules/RoomsGrid";
import SettingsScreen from "@/modules/SettingsScreen";
import SimsScreen from "@/modules/SimsScreen";
import TrackArt from "@/modules/TrackArt";

export default function PanelScreen({
  view,
  locationId,
}: {
  view: PanelView;
  locationId?: string;
}) {
  const { t, lang, openRoom, selectLocation } = usePanel();
  const { popped } = useMusic();
  const place = findLocation(locationId);

  if (view === "music") {
    return popped ? <TrackArt lang={lang} /> : <Mp3Player t={t} lang={lang} />;
  }

  return (
    <MapScreen
      key={view}
      title={t[VIEW_SCREENS[view].titleKey]}
      subtitle={VIEW_SCREENS[view].subtitle}
    >
      {view === "rooms" && place && (
        <RoomsGrid rooms={place.rooms} onOpen={openRoom} t={t} lang={lang} />
      )}
      {view === "sims" && place && <SimsScreen slots={place.sims} t={t} />}
      {view === "map" && (
        <MapView t={t} current={place} onSelect={selectLocation} />
      )}
      {view === "local" && <DownloadScreen t={t} />}
      {view === "settings" && <SettingsScreen t={t} />}
    </MapScreen>
  );
}
