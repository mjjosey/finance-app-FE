import { useEffect } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useThemeMode } from '../../ThemeProvider';
import { useForm, useWatch } from 'react-hook-form';
import RhfTextField from '../../components/RhfTextField';
import { RhfAutocomplete } from '../../components/RhfAutocomplete';

const AddPurchase = ({
  onSubmit,
  submitting,
  submitError,
  onClose,
  selectedPurchase,
  supplierOptions = [],
  itemOptions = [],
}) => {
  const getSupplierOptionById = (supplierId) =>
    supplierOptions.find((option) => option.supplierID === supplierId) ?? null;
  const getItemOptionById = (itemId) =>
    itemOptions.find((option) => option.itemID === itemId) ?? null;

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      supplier: null,
      item: null,
      invoiceNumber: '',
      quantity: '',
      price: '',
      purchaseDate: '',
      paidStatus: '',
    },
  });

  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const selectedItem = useWatch({ control, name: 'item' });

  useEffect(() => {
    if (selectedPurchase) {
      reset({
        supplier: getSupplierOptionById(selectedPurchase.supplierID),
        item: getItemOptionById(selectedPurchase.itemID),
        invoiceNumber:
          selectedPurchase.invoiceNumber ??
          selectedPurchase.invoiceNo ??
          selectedPurchase.invoice ??
          '',
        quantity: selectedPurchase.quantity ?? '',
        price: selectedPurchase.price ?? selectedPurchase.Price ?? '',
        purchaseDate: selectedPurchase.purchaseDate ?? '',
        paidStatus: selectedPurchase.paidStatus ?? '',
      });
      return;
    }

    reset({
      supplier: null,
      item: null,
      invoiceNumber: '',
      quantity: '',
      price: '',
      purchaseDate: '',
      paidStatus: '',
    });
  }, [selectedPurchase, reset, supplierOptions, itemOptions]);

  useEffect(() => {
    if (!selectedItem) {
      if (!selectedPurchase) {
        setValue('price', '', { shouldValidate: true, shouldDirty: true });
      }
      return;
    }

    const priceFromItem = selectedPurchase
      ? (selectedPurchase.price ?? selectedPurchase.Price)
      : (selectedItem.price ?? selectedItem.itemPrice ?? selectedItem.Price);

    if (priceFromItem === undefined || priceFromItem === null || priceFromItem === '') return;

    setValue('price', Number(priceFromItem), { shouldValidate: true, shouldDirty: true });
  }, [selectedItem, selectedPurchase, setValue]);

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
            <Button variant="text" color="inherit" startIcon={<CloseIcon />} onClick={onClose}>
              Close
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfAutocomplete
              name="item"
              control={control}
              label="Item Name"
              required
              fullWidth
              options={itemOptions}
              getOptionLabel={(option) => option?.itemName ?? ''}
              isOptionEqualToValue={(option, value) => option?.itemID === value?.itemID}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfAutocomplete
              name="supplier"
              control={control}
              label="Supplier Name"
              required
              options={supplierOptions}
              getOptionLabel={(option) => option?.supplierName ?? ''}
              isOptionEqualToValue={(option, value) => option?.supplierID === value?.supplierID}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField
              name="invoiceNumber"
              control={control}
              label="Invoice Number"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField
              name="quantity"
              control={control}
              label="Quantity"
              type="number"
              required
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField
              name="price"
              control={control}
              label="Price"
              type="number"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RhfTextField
              name="purchaseDate"
              control={control}
              label="Purchase Date"
              type="date"
              required
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={submitting}
              sx={{ minWidth: 150, mt: 1 }}
            >
              {submitting ? 'Saving...' : selectedPurchase ? 'Update Purchase' : 'Save Purchase'}
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

export default AddPurchase;
