import React, { useMemo, useState } from "react";
import { Box, Stack, Button, Typography } from "@mui/material";
import SearchBar from "../components/SearchBar";
import ModelCard from "../components/ModelCard";
import CardsGrid from "../components/CardsGrid";

export default function ModelsList({ rows = [], onSelect }) {
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
      {/* Search + button snug together */}
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
      </Stack>

      {/* Left-anchored, responsive grid (same as UploadsList) */}
      <Box sx={{ mt: 2, width: "100%", overflow: "visible" }}>
        <CardsGrid
          sx={{
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            px: 0,
            justifyContent: "flex-start !important",
            justifyItems: "stretch",
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
              <ModelCard
                item={item}
                onClick={() => onSelect && onSelect(item)}  // <-- THIS is the important part
              />
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
