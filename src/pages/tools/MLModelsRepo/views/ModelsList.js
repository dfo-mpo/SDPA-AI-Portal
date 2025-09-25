import React, { useMemo, useState } from "react";
import { Typography, Box } from "@mui/material";
import SearchBar from "../components/SearchBar";
import ModelCard from "../components/ModelCard";
import CardsGrid from "../components/CardsGrid";

export default function ModelsList({ rows = [], onOpenModel }) {
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
      <SearchBar value={query} onChange={setQuery} placeholder="Search by name or tag" />

      <Box sx={{ mt: 2 }}>
        <CardsGrid>
          {filtered.map((item) => (
            <Box key={item.id}>
              <ModelCard item={item} onClick={() => onOpenModel?.(item.id)} />
            </Box>
          ))}
        </CardsGrid>

        {filtered.length === 0 && (
          <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
            No models found.
          </Typography>
        )}
      </Box>
    </>
  );
}
