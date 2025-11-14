// ModelsList.jsx (only the CardsGrid usage block changed)
import React, { useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import SearchBar from "../components/SearchBar";
import ModelCard from "../components/ModelCard";
import CardsGrid from "../components/CardsGrid";

export default function ModelsList({ rows = [], onSelect, onHistory, showSearch = true }) {
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
      {showSearch && (
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
              minWidth: 300,
              width: { xs: "100%", sm: "auto" },
            }}
          />
        </Stack>
      )}

      <Box sx={{ mt: 2, width: "100%", overflow: "visible" }}>
        <CardsGrid sx={{ width: "100%", maxWidth: "100%", mx: 0, px: 0 }}>
          {filtered.map((item) => (
            <Box key={item.id}>
              <ModelCard
                item={item}
                onReadme={() => onSelect && onSelect(item)}
                onHistory={onHistory ? () => onHistory(item) : undefined}
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
