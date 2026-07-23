import { useEffect } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useThemeMode } from '../../ThemeProvider';
import { useForm } from 'react-hook-form';
import RhfTextField from '../../components/RhfTextField';

const AddSupplier = ({ onSubmit, submitting, submitError, onClose, selectedSupplier }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      supplierName: '',
      email: '',
      mobile: '',
      city: '',
    },
  });

  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  useEffect(() => {
    if (selectedSupplier) {
      reset({
        supplierName: selectedSupplier.supplierName ?? '',
        email: selectedSupplier.email ?? '',
        mobile: selectedSupplier.mobile ?? '',
        city: selectedSupplier.city ?? '',
      });
      return;
    }

    reset({ supplierName: '', email: '', mobile: '', city: '' });
  }, [selectedSupplier, reset]);

  return (
    <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', p: 2, borderRadius: 2 }}>
      <Paper
        elevation={1}
        sx={{ p: 2, mb: 2, bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}
      >
        <Grid
          container
          spacing={2}
          rowSpacing={3}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Grid size={{ xs: 12, md: 6 }} />
          <Grid size={{ xs: 12, md: 4 }} />
          <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<CloseIcon />}
              onClick={onClose}
              sx={{ border: '3px solid red' }}
            >
              Close
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <RhfTextField
              name="supplierName"
              control={control}
              label="Supplier Name"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <RhfTextField
              name="email"
              control={control}
              label="Email"
              type="email"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <RhfTextField name="mobile" control={control} label="Mobile" required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <RhfTextField name="city" control={control} label="City" required fullWidth />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={submitting}
              sx={{ minWidth: 150, mt: 1 }}
            >
              {submitting ? 'Saving...' : selectedSupplier ? 'Update Supplier' : 'Save Supplier'}
            </Button>
          </Grid>

          {submitError ? (
            <Grid size={{ xs: 12 }}>
              <Typography color="error" variant="body2">
                {submitError}
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </Paper>
    </Box>
  );
};

export default AddSupplier;
