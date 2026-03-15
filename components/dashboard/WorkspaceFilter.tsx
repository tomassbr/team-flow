"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";

export function WorkspaceFilter() {
  return (
    <SegmentedControl
      options={[
        { value: "all", label: "All" },
        { value: "available", label: "Available" },
      ]}
      value="all"
      onChange={() => {}}
    />
  );
}
