"use client";

import { ReactNode } from "react";
import { useDragSpring } from "@/hooks/useDragSpring";

export default function DraggableControl({ children }: { children: ReactNode }) {
  const drag = useDragSpring();

  return (
    <div
      ref={drag.pieceRef}
      data-control
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onClickCapture={drag.onClickCapture}
      className="relative flex touch-none select-none will-change-transform"
      style={{ cursor: "grab", transition: drag.spring }}
    >
      {children}
    </div>
  );
}
