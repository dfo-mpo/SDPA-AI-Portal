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
      {/* Top bar: Search (left) and + New Model (right) */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2, flexWrap: "wrap", rowGap: 2 }}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by name or tag"
          sx={{ flexGrow: 1, maxWidth: 480 }}
        />
        <Button variant="contained" onClick={onCreateClick} sx={{ whiteSpace: "nowrap" }}>
          + New Model
        </Button>
      </Stack>

      <Box>
        <CardsGrid>
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
