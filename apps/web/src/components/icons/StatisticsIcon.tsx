import * as React from "react";
import { IconBase } from "./IconBase";

export function StatisticsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="3" y="12.5" width="4.6" height="8.5" rx="1" />
      <rect x="9.7" y="3.5" width="4.6" height="17.5" rx="1" />
      <rect x="16.4" y="8.5" width="4.6" height="12.5" rx="1" />
      <path d="M2.5 21h19" />
    </IconBase>
  );
}
