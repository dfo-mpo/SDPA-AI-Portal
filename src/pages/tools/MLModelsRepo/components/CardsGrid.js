import React from "react";
import { Box } from "@mui/material";

/**
 * Centered, fixed-width responsive grid for cards:
 * - lg: 3 columns
 * - md: 2 columns
 * - xs: 1 column
 * Cards keep their shape; the grid centers when there are fewer items.
 */
export default function CardsGrid({ children, colWidth = 360, minColWidth = 300, gap = 2, sx }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap,
        // fixed-ish column widths (won't squish content);
        // centers leftover space so 1–2 items still look good
        gridTemplateColumns: {
          xs: `repeat(1, minmax(${minColWidth}px, ${colWidth}px))`,
          md: `repeat(2, minmax(${minColWidth}px, ${colWidth}px))`,
          lg: `repeat(3, minmax(${minColWidth}px, ${colWidth}px))`,
        },
        justifyContent: "center",   // center the grid row
        justifyItems: "stretch",    // cards stretch to cell width
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
