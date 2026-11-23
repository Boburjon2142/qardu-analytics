import * as React from "react";
import { IconBase } from "./IconBase";

export function FacultiesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 21V11h5.5V4h7v7H21v10M2 21h20" />
      <path d="M12 8h.01M12 12h.01M5.7 15h.01M18.3 15h.01" />
      <path d="M10 21v-3.5h4V21" />
    </IconBase>
  );
}
