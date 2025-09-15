// src/pages/tools/MLModelsRepo/views/ModelsList.js
import React, { useMemo, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import SearchBar from "../components/SearchBar";
import ModelCard from "../components/ModelCard";

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
      <Box sx={{ px: 2 }}>
        <Grid container spacing={2} sx={{ m: 0 }}>
          {filtered.map((item) => (
            <Grid
              key={item.id}
              item
              xs={12}   // <600px -> 1 per row
              md={6}    // ≥900px  -> 2 per row
              lg={4}    // ≥1200px -> 3 per row
            >
              <ModelCard item={item} onClick={() => onOpenModel?.(item.id)} />
            </Grid>
          ))}

          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                No models found.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
}
