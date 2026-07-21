import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function RhfTextField({
  name,
  control,
  label,
  type = 'text',
  required = false,
  fullWidth = true,
  ...rest
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? `${label} is required` : false }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth={fullWidth}
          label={label}
          type={type}
          value={field.value ?? ''}
          error={Boolean(error)}
          helperText={error?.message}
          onChange={(event) => {
            const value = event.target.value;
            field.onChange(type === 'number' && value !== '' ? Number(value) : value);
          }}
          {...rest}
        />
      )}
    />
  );
}
