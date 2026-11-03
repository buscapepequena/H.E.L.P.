"use client";

import { useEffect, useState } from "react";
import { ClockTime } from "@/types/scene";

const readTime = (formatter: Intl.DateTimeFormat): ClockTime => {
  const parts = formatter.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    hours: get("hour") % 24,
    minutes: get("minute"),
    seconds: get("second"),
  };
};

export const useClockTime = (timeZone: string): ClockTime | null => {
  const [time, setTime] = useState<ClockTime | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    });
    const tick = () => setTime(readTime(formatter));
    const first = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [timeZone]);

  return time;
};
