"use client";

import { useState } from "react";
import { playClick } from "@/hooks/soundEffects";
import { PanelDictionary, SimSlot } from "@/types/panel";
import SimsGrid from "@/modules/SimsGrid";
import SimViewer from "@/modules/SimViewer";

export default function SimsScreen({
  slots,
  t,
}: {
  slots: SimSlot[];
  t: PanelDictionary;
}) {
  const [open, setOpen] = useState<SimSlot | null>(null);

  return (
    <>
      <SimsGrid
        slots={slots}
        label={t.sims}
        onOpen={(slot) => {
          playClick(1.15);
          setOpen(slot);
        }}
      />
      {open && (
        <SimViewer
          key={open.id}
          slot={open}
          t={t}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
