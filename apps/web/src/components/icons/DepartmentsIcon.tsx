import * as React from "react";
import { IconBase } from "./IconBase";

export function DepartmentsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="9" y="3" width="6" height="5" rx="1.5" />
      <rect x="2.5" y="16" width="5" height="5" rx="1.5" />
      <rect x="9.5" y="16" width="5" height="5" rx="1.5" />
      <rect x="16.5" y="16" width="5" height="5" rx="1.5" />
      <path d="M12 8v8M5 16v-4h14v4" />
    </IconBase>
  );
}
