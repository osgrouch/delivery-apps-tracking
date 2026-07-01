import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiCard } from "@/components/ui/KpiCard";

describe("KpiCard", () => {
  it("renders the label and value", () => {
    render(<KpiCard label="Total earnings" value="$1,234.50" />);

    expect(screen.getByText("Total earnings")).toBeInTheDocument();
    expect(screen.getByText("$1,234.50")).toBeInTheDocument();
  });

  it("renders an optional sublabel", () => {
    render(<KpiCard label="Total hours" value="42.0" sublabel="last 30 days" />);

    expect(screen.getByText("last 30 days")).toBeInTheDocument();
  });

  it("omits the sublabel element when not provided", () => {
    render(<KpiCard label="Total hours" value="42.0" />);

    expect(screen.queryByText("last 30 days")).not.toBeInTheDocument();
  });
});
