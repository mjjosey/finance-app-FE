import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Alert, Box, Button, Grid, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import axios from '../../api/axios';
import RhfTextField from '../../components/RhfTextField';
import { RhfAutocomplete } from '../../components/RhfAutocomplete';
import { useThemeMode } from '../../ThemeProvider';

export default function AddReceipt({ open, onClose, selectedRecord, onSaved }) {
  const [sales, setSales] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const [saleOptions, setSaleOptions] = useState([]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      amount: '',
      receiptDate: '',
      sale: null,
      customer: null,
    },
  });

  const selectedCustomer = useWatch({ control, name: 'customer' });
  const selectedSale = useWatch({ control, name: 'sale' });
  const selectedCustomerId =
    selectedCustomer?.value ?? selectedCustomer?.customerID ?? selectedCustomer?.id ?? null;

  const normalizedSales = useMemo(
    () =>
      sales.map((item) => ({
        ...item,
        salesID: item.salesID ?? item.id,
        customerID: item.customer?.customerID ?? item.customerID ?? item.customer?.id ?? null,
        invoiceNumber:
          item.invoiceNumber ??
          item.invoiceNo ??
          item.invoice ??
          `Sale #${item.salesID ?? item.id}`,
      })),
    [sales],
  );
  const filteredSalesList = async () => {
    const customerId =
      selectedCustomer?.value ?? selectedCustomer?.customerID ?? selectedCustomer?.id ?? null;
    try {
      const customerRes = await axios.get(`/sales/${customerId}`);
      const filteredSales = customerId
        ? normalizedSales.filter((item) => item.customerID === customerId)
        : normalizedSales;

      const options = filteredSales.map((item) => ({
        label: item.invoiceNumber || `Sale #${item.salesID}`,
        value: item.salesID,
        customerID: item.customerID,
      }));
      console.log(options, 'filteredSales');
      setSaleOptions(options);
    } catch (err) {
      console.log(err.response.data.message);

      setSaleOptions([]);
    }
  };
  useEffect(() => {
    if (selectedCustomerId) {
      filteredSalesList();
    }
  }, [selectedCustomer?.value]);

  const customerOptions = useMemo(
    () =>
      customers.map((item) => ({
        label: item.customerName || `Customer #${item.customerID}`,
        value: item.customerID,
      })),
    [customers],
  );

  const fetchCustomerSales = async (customerId) => {
    if (!customerId) {
      setSales(allSales);
      return;
    }

    try {
      const response = await axios.get(`/sales/${customerId}`);
      const payload = response?.data?.content ?? [];
      const normalizedCustomerSales = Array.isArray(payload) ? payload : [];
      setSales(normalizedCustomerSales);
    } catch (err) {
      console.error('Failed to fetch sales for customer:', err);
      setError('Unable to load sales for the selected customer.');
    }
  };

  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      try {
        const [saleRes, customerRes] = await Promise.all([
          axios.get('/sales'),
          axios.get('/customers'),
        ]);

        const initialSales = Array.isArray(saleRes.data)
          ? saleRes.data
          : saleRes.data?.content || [];
        setAllSales(initialSales);
        setSales(initialSales);
        const options = initialSales.map((item) => ({
          label: item.invoiceNumber || `Sale #${item.salesID}`,
          value: item.salesID,
          customerID: item.customerID,
        }));
        setSaleOptions(options);
        setCustomers(
          Array.isArray(customerRes.data) ? customerRes.data : customerRes.data?.content || [],
        );
      } catch (err) {
        setError('Unable to load dropdown data.');
      }
    };

    fetchLookups();
  }, [open]);
console.log(saleOptions,"saleopt");

  useEffect(() => {
    if (!open) return;

    const selectedSaleOption =
      saleOptions.find(
        (option) => option.value === (selectedRecord?.sales?.salesID || selectedRecord?.salesID),
      ) || null;
    const selectedCustomerOption =
      customerOptions.find(
        (option) =>
          option.value === (selectedRecord?.customer?.customerID || selectedRecord?.customerID),
      ) || null;
console.log(selectedSaleOption, 'selectedSaleOption');

    if (selectedRecord) {
      reset({
        amount: selectedRecord.amount ?? '',
        receiptDate: selectedRecord.receiptDate ?? '',
        sale: selectedSaleOption,
        customer: selectedCustomerOption,
      });
    } else {
      reset({
        amount: '',
        receiptDate: '',
        sale: null,
        customer: null,
      });
    }
  }, [open, selectedRecord, saleOptions?.length, customers, reset]);

  const onSubmit = async (values) => {
    setLoading(true);
    setError('');

    const payload = {
      amount: Number(values.amount),
      receiptDate: values.receiptDate,
      sales: { salesID: values.sale?.value ?? values.sale },
      customer: { customerID: values.customer?.value ?? values.customer },
    };

    try {
      if (selectedRecord?.receiptID) {
        await axios.put(`/receipts/${selectedRecord.receiptID}`, payload);
      } else {
        await axios.post('/receipts', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save receipt.');
    } finally {
      setLoading(false);
    }
  };
console.log(customerOptions,"customerOptions");

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
              name="customer"
              label="Customer"
              options={customerOptions}
              getOptionLabel={(option) => option?.label ?? ''}
              isOptionEqualToValue={(option, value) => option?.value === value?.value}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <RhfAutocomplete
              control={control}
              name="sale"
              label="Sale"
              options={saleOptions}
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
              name="receiptDate"
              label="Receipt Date"
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
              {loading ? 'Saving...' : selectedRecord ? 'Update Receipt' : 'Save Receipt'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
