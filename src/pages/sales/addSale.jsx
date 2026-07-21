import { useEffect } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useThemeMode } from '../../ThemeProvider';
import { useForm } from 'react-hook-form';
import RhfTextField from '../../components/RhfTextField';
import { RhfAutocomplete } from '../../components/RhfAutocomplete';

const AddSale = ({
  onSubmit,
  submitting,
  submitError,
  onClose,
  selectedSale,
  itemOptions = [],
  customerOptions = [],
}) => {
  const getItemOptionById = (itemId) => itemOptions.find((option) => option.itemID === itemId) ?? null;
  const getCustomerOptionById = (customerId) => customerOptions.find((option) => option.customerID === customerId) ?? null;

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      item: null,
      customer: null,
      quantity: '',
      price: '',
      saleDate: '',
      paidStatus: '',
    },
  });

  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  useEffect(() => {
    if (selectedSale) {
      reset({
        item: getItemOptionById(selectedSale.itemID),
        customer: getCustomerOptionById(selectedSale.customerID),
        quantity: selectedSale.quantity ?? '',
        price: selectedSale.price ?? selectedSale.Price ?? '',
        saleDate: selectedSale.saleDate ?? '',
        paidStatus: selectedSale.paidStatus ?? '',
      });
      return;
    }

    reset({
      item: null,
      customer: null,
      quantity: '',
      price: '',
      saleDate: '',
      paidStatus: '',
    });
  }, [selectedSale, reset, itemOptions, customerOptions]);

  return (
    <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', p: 2, borderRadius: 2 }}>
      <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}>
        <Grid container spacing={2} rowSpacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
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

          <Grid size={{ xs: 12, md: 4 }}>
            <RhfAutocomplete
              name="item"
              control={control}
              label="Item Name"
              required
              options={itemOptions}
              getOptionLabel={(option) => option?.itemName ?? ''}
              isOptionEqualToValue={(option, value) => option?.itemID === value?.itemID}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfAutocomplete
              name="customer"
              control={control}
              label="Customer Name"
              required
              fullWidth
              options={customerOptions}
              getOptionLabel={(option) => option?.customerName ?? ''}
              isOptionEqualToValue={(option, value) => option?.customerID === value?.customerID}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField name="quantity" control={control} label="Quantity" type="number" required fullWidth />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField name="price" control={control} label="Price" type="number" required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField name="saleDate" control={control} label="Sale Date" type="date" required fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField name="paidStatus" control={control} label="Paid Status" required fullWidth />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={submitting}
              sx={{ minWidth: 150, mt: 1 }}
            >
              {submitting ? 'Saving...' : selectedSale ? 'Update Sale' : 'Save Sale'}
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

export default AddSale;