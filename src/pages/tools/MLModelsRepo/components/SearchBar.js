import React from "react";
import { Stack, TextField, InputAdornment } from "@mui/material";
import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search…", sx}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} />
            </InputAdornment>
          ),
        }}
        sx={{
          maxWidth: 415,
          ...sx,
        }}
      />
    </Stack>
  );
}
