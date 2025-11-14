// CardsGrid.jsx
import React from "react";
import { Box } from "@mui/material";

export default function CardsGrid({ children, gap = 2, sx }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap,
        // Each column is 380–420px, and we pack them from the LEFT
        gridTemplateColumns: "repeat(auto-fill, minmax(370px, 417px))",
        justifyContent: "flex-start",
        alignItems: "stretch",
        width: "100%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
