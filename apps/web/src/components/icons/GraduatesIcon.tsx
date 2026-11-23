import * as React from "react";
import { IconBase } from "./IconBase";

export function GraduatesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 2.6 16.8 4.8 12 7 7.2 4.8z" />
      <circle cx="12" cy="11.2" r="2.6" />
      <path d="M7.8 21v-1.4c0-2.4 1.9-4 4.2-4s4.2 1.6 4.2 4V21" />
      <circle cx="4.1" cy="13" r="1.9" />
      <path d="M1.8 20.5v-.8c0-1.7.9-2.9 2.3-2.9" />
      <circle cx="19.9" cy="13" r="1.9" />
      <path d="M22.2 20.5v-.8c0-1.7-.9-2.9-2.3-2.9" />
    </IconBase>
  );
}
