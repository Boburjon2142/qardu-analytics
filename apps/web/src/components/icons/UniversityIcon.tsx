import * as React from "react";
import { IconBase } from "./IconBase";

export function UniversityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 6.2V2.4l3.2 1.4-3.2 1.4" />
      <path d="M3.5 11 12 6.2l8.5 4.8z" />
      <path d="M7 14.2v4.3M12 14.2v4.3M17 14.2v4.3" />
      <path d="M3.5 21h17" />
    </IconBase>
  );
}
