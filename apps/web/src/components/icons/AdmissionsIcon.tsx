import * as React from "react";
import { IconBase } from "./IconBase";

export function AdmissionsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9 4H6.5a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H15" />
      <path d="M10 2.5h4a1 1 0 0 1 1 1V5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
      <path d="m8.8 13.5 2.4 2.4 4-4.4" />
    </IconBase>
  );
}
