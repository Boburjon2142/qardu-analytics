import * as React from "react";
import { IconBase } from "./IconBase";

export function ResearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9.5 3h5" />
      <path d="M10 3v6L4.8 18.3A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.7L14 9V3" />
      <path d="M7 15.5c1.7-1.2 3.3-1.2 5 0s3.3 1.2 5 0" />
      <path d="M10.8 12.4h.01M13.2 11.2h.01" />
    </IconBase>
  );
}
