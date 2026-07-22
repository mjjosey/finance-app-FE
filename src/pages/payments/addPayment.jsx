import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Grid, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import axios from '../../api/axios';
import RhfTextField from '../../components/RhfTextField';
import { RhfAutocomplete } from '../../components/RhfAutocomplete';
import { useThemeMode } from '../../ThemeProvider';

export default function AddPayment({ open, onClose, selectedRecord, onSaved }) {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      amount: '',
      paymentDate: '',
      purchase: null,
      supplier: null,
    },
  });

  const purchaseOptions = useMemo(
    () => purchases.map((item) => ({ label: item.invoiceNumber || `Purchase #${item.purchaseID}`, value: item.purchaseID })),
    [purchases]
  );

  const supplierOptions = useMemo(
    () => suppliers.map((item) => ({ label: item.supplierName || `Supplier #${item.supplierID}`, value: item.supplierID })),
    [suppliers]
  );

  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      try {
        const [purchaseRes, supplierRes] = await Promise.all([
          axios.get('/purchases'),
          axios.get('/suppliers'),
        ]);

        setPurchases(Array.isArray(purchaseRes.data) ? purchaseRes.data : purchaseRes.data?.content || []);
        setSuppliers(Array.isArray(supplierRes.data) ? supplierRes.data : supplierRes.data?.content || []);
      } catch (err) {
        setError('Unable to load dropdown data.');
      }
    };

    fetchLookups();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const selectedPurchase = purchaseOptions.find((option) => option.value === (selectedRecord?.purchase?.purchaseID || selectedRecord?.purchaseID)) || null;
    const selectedSupplier = supplierOptions.find((option) => option.value === (selectedRecord?.supplier?.supplierID || selectedRecord?.supplierID)) || null;

    if (selectedRecord) {
      reset({
        amount: selectedRecord.amount ?? '',
        paymentDate: selectedRecord.paymentDate ?? '',
        purchase: selectedPurchase,
        supplier: selectedSupplier,
      });
    } else {
      reset({
        amount: '',
        paymentDate: '',
        purchase: null,
        supplier: null,
      });
    }
  }, [open, selectedRecord, purchaseOptions, supplierOptions, reset]);

  const onSubmit = async (values) => {
    setLoading(true);
    setError('');

    const payload = {
      amount: Number(values.amount),
      paymentDate: values.paymentDate,
      purchase: { purchaseID: values.purchase?.value ?? values.purchase },
      supplier: { supplierID: values.supplier?.value ?? values.supplier },
    };

    try {
      if (selectedRecord?.paymentID) {
        await axios.put(`/payments/${selectedRecord.paymentID}`, payload);
      } else {
        await axios.post('/payments', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', p: 2, borderRadius: 2, mb: 2 }}>
      <Paper elevation={1} sx={{ p: 2, bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{selectedRecord ? 'Edit Payment' : 'Add Payment'}</Typography>
          <Button variant="text" color="inherit" startIcon={<CloseIcon />} onClick={onClose}>
            Close
          </Button>
        </Box>

        <Grid container spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
          {error ? (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          ) : null}

          <Grid item xs={12} md={6}>
            <RhfAutocomplete
              control={control}
              name="purchase"
              label="Purchase"
              options={purchaseOptions}
              getOptionLabel={(option) => option?.label ?? ''}
              isOptionEqualToValue={(option, value) => option?.value === value?.value}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RhfAutocomplete
              control={control}
              name="supplier"
              label="Supplier"
              options={supplierOptions}
              getOptionLabel={(option) => option?.label ?? ''}
              isOptionEqualToValue={(option, value) => option?.value === value?.value}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RhfTextField
              control={control}
              name="amount"
              label="Amount"
              type="number"
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RhfTextField
              control={control}
              name="paymentDate"
              label="Payment Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSubmitting || loading}>
              {loading ? 'Saving...' : selectedRecord ? 'Update Payment' : 'Save Payment'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
