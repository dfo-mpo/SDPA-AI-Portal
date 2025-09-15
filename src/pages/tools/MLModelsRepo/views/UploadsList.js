// src/pages/tools/MLModelsRepo/views/UploadsList.js
import React, { useMemo, useState } from "react";
import { Grid, Box, Stack, Button, Typography } from "@mui/material";
import ModelCard from "../components/ModelCard";
import SearchBar from "../components/SearchBar";

export default function UploadsList({ rows = [], onOpenModel, onCreateClick }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        (r.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }, [rows, query]);

  return (
    <>
      {/* Top bar: Search (left) and + New Model (right).*/}
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
        <Button
          variant="contained"
          onClick={onCreateClick}
          sx={{ whiteSpace: "nowrap" }}
        >
          + New Model
        </Button>
      </Stack>

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
