import { Autocomplete, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

export function RhfAutocomplete({
  name,
  control,
  label,
  options = [],
  required = false,
  fullWidth = true,
  getOptionLabel,
  isOptionEqualToValue,
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? `${label} is required` : false }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Autocomplete
          options={options}
          value={value || null}
          onChange={(_, newValue) => onChange(newValue)}
          fullWidth={fullWidth}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={Boolean(error)}
              helperText={error?.message}
            />
          )}
        />
      )}
    />
  );
}
