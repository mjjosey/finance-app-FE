import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Alert, Box, Button, Grid, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import axios from '../../api/axios';
import RhfTextField from '../../components/RhfTextField';
import { RhfAutocomplete } from '../../components/RhfAutocomplete';
import { useThemeMode } from '../../ThemeProvider';

export default function AddPayment({ open, onClose, selectedRecord, onSaved }) {
  const [purchases, setPurchases] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      amount: '',
      paymentDate: '',
      purchase: null,
      supplier: null,
    },
  });

  const selectedSupplier = useWatch({ control, name: 'supplier' });
    const selectedPurchase = useWatch({ control, name: 'purchase' });
  const selectedSupplierId =
    selectedSupplier?.value ?? selectedSupplier?.supplierID ?? selectedSupplier?.id ?? null;
  const selectedPurchaseId = selectedPurchase?.value ?? selectedPurchase?.purchaseID ?? selectedPurchase?.id ?? null;

  const normalizedPurchases = useMemo(
    () =>
      purchases.map((item) => ({
        ...item,
        purchaseID: item.purchaseID ?? item.id,
        supplierID: item.supplier?.supplierID ?? item.supplierID ?? item.supplier?.id ?? null,
        invoiceNumber:
          item.invoiceNumber ??
          item.invoiceNo ??
          item.invoice ??
          `Purchase #${item.purchaseID ?? item.id}`,
      })),
    [purchases],
  );

    const purchaseOptions = useMemo(
    () =>
      normalizedPurchases.map((item) => ({
        label: item.invoiceNumber || `Purchase #${item.purchaseID}`,
        value: item.purchaseID,
        supplierID: item.supplierID,
      })),
    [normalizedPurchases],
  );

  const supplierOptions = useMemo(
    () =>
      suppliers.map((item) => ({
        label: item.supplierName || `Supplier #${item.supplierID}`,
        value: item.supplierID,
      })),
    [suppliers],
  );

  useEffect(() => {
    fetchSupplierPurchases(selectedSupplierId);
  }, [selectedSupplierId]);

  const fetchSupplierPurchases = async (supplierId) => {
    if (!supplierId) {
      setPurchases(allPurchases);
      return;
    }

        try {
      const response = await axios.get(`/purchases/${supplierId}`);
      const payload = response?.data?.content ?? [];
      const normalizedSupplierPurchases = Array.isArray(payload) ? payload : [];
      setPurchases(normalizedSupplierPurchases);
      const selectedStillValid = normalizedSupplierPurchases.some(
        (item) => (item.purchaseID ?? item.id) === selectedPurchaseId,
      );
      if (selectedPurchaseId && !selectedStillValid) {
        setValue('purchase', null);
      }
    } catch (err) {
      console.error('Failed to fetch purchases for supplier:', err);
      setError('Unable to load purchases for the selected supplier.');
    }
  };
console.log(selectedRecord,"selectedRecord");

  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      try {
        const [purchaseRes, supplierRes] = await Promise.all([
          axios.get('/purchases'),
          axios.get('/suppliers'),
        ]);

        const initialPurchases = Array.isArray(purchaseRes.data)
          ? purchaseRes.data
          : purchaseRes.data?.content || [];
        setAllPurchases(initialPurchases);
        setPurchases(initialPurchases);
        setSuppliers(
          Array.isArray(supplierRes.data) ? supplierRes.data : supplierRes.data?.content || [],
        );
      } catch (err) {
        setError('Unable to load dropdown data.');
      }
    };

    fetchLookups();
  }, [open]);
 useEffect(() => {
    if (!selectedPurchase?.supplierID) return;

    const purchaseSupplierId = selectedPurchase.supplierID;
    const currentSupplierId =
      selectedSupplier?.value ?? selectedSupplier?.supplierID ?? selectedSupplier?.id ?? null;

    if (currentSupplierId === purchaseSupplierId) return;

    const matchedSupplier = supplierOptions.find((option) => option.value === purchaseSupplierId);
    if (matchedSupplier) {
      setValue('supplier', matchedSupplier, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedPurchase, selectedSupplier, supplierOptions, setValue]);
   useEffect(() => {
    if (!open || selectedRecord) return;

    reset({
          amount: '',
      paymentDate: '',
      purchase: null,
      supplier: null
    });
  }, [open, selectedRecord, reset]);
  useEffect(() => {
    if (!open || !selectedRecord) return;

    const selectedPurchaseId =
      selectedRecord?.purchase?.purchaseID ??
      selectedRecord?.purchaseID ??
      selectedRecord?.purchaseId ??
      null;
    const selectedSupplierIdFromRecord =
      selectedRecord?.supplier?.supplierID ??
      selectedRecord?.supplierID ??
      selectedRecord?.supplierId ??
      null;

    const selectedPurchaseOption =
      purchaseOptions.find((option) => option.value === selectedPurchaseId) ??
      (selectedPurchaseId
        ? {
            value: selectedPurchaseId,
            label:
              selectedRecord?.purchase?.invoiceNumber ??
              selectedRecord?.purchaseName ??
              `Purchase #${selectedPurchaseId}`,
            supplierID: selectedSupplierIdFromRecord,
          }
        : null);

    const selectedSupplierOption =
      supplierOptions.find((option) => option.value === selectedSupplierIdFromRecord) ??
      (selectedSupplierIdFromRecord
        ? {
            value: selectedSupplierIdFromRecord,
            label:
              selectedRecord?.supplier?.supplierName ??
              selectedRecord?.supplierName ??
              `Supplier #${selectedSupplierIdFromRecord}`,
          }
        : null);

    reset({
      amount: '',
      paymentDate: '',
      purchase: null,
      supplier: null,
    });
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
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
            <RhfTextField control={control} name="amount" label="Amount" type="number" required />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RhfTextField
              control={control}
              name="paymentDate"
              label="Payment Date"
              type="date"
              required
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
              disabled={isSubmitting || loading}
            >
              {loading ? 'Saving...' : selectedRecord ? 'Update Payment' : 'Save Payment'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
