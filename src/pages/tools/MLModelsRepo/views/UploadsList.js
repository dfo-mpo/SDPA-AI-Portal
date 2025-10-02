import React, { useMemo, useState } from "react";
import { Box, Stack, Button, Typography } from "@mui/material";
import ModelCard from "../components/ModelCard";
import SearchBar from "../components/SearchBar";
import CardsGrid from "../components/CardsGrid";

export default function UploadsList({ rows = [], onOpenModel, onCreateClick }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  }, [rows, query]);

  return (
    <>
      <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ mb: 2, flexWrap: { xs: "wrap", sm: "nowrap" } }}
    >
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by name or tag"
        sx={{
          flex: "1 1 520px",
          minWidth: 240,
          width: { xs: "100%", sm: "auto" },
        }}
      />
      <Button
        variant="contained"
        onClick={onCreateClick}
        sx={{
          flexShrink: 0,
          whiteSpace: "nowrap",
          mt: { xs: 1, sm: 0 },
        }}
      >
        + New Model
      </Button>
    </Stack>

      {/* Grid pinned to page width (no off-screen overflow) */}
      <Box sx={{ mt: 2, width: "100%", overflowX: "visible" }}>
        <CardsGrid
          sx={{
            // ensure it can’t be wider than the Paper
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            px: 0,

            // force left alignment
            justifyContent: "flex-start !important",
            justifyItems: "stretch",

            // make it responsive even if CardsGrid has defaults
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2.5,
            boxSizing: "border-box",
          }}
        >
          {filtered.map((item) => (
            <Box key={item.id}>
              <ModelCard item={item} onClick={() => onOpenModel?.(item.id)} />
            </Box>
          ))}
        </CardsGrid>

        {filtered.length === 0 && (
          <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
            No uploads match your search.
          </Typography>
        )}
      </Box>
    </>
  );
}
