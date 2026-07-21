import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import RhfTextField from '../components/RhfTextField';
import { itemHeaders } from '../constants';
import ListingTemplate from '../listing/ListingTemplate';
import api from '../api/axios';
import { useThemeMode } from '../ThemeProvider';

export default function Items() {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      itemName: '',
      price: '',
    },
  });

  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { mode, toggleThemeMode } = useThemeMode();
  const isDark = mode === 'dark';
    const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const textColor = isDark ? '#ffffff' : '#111111';
  const mutedText = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const fetchItems = async (pageNumber = 0, pageSize = 5, sortBy = 'itemName', sortOrder = 'asc') => {
    try {
      setLoading(true);
      const response = await api.get(`/items?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const payload = response?.data?.content ?? [];
      const normalizedItems = Array.isArray(payload) ? payload : [];

      setItems(
        normalizedItems.map((item) => ({
          ...item,
          itemName: item.itemName ?? item.name ?? 'Unknown Item',
          price: item.Price ?? item.price ?? '-',
        })),
      );
      setTotalItems(response?.data?.totalElements ?? normalizedItems.length);
      setError('');
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Unable to load items right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');

    // Get form values during submit
    console.log('Form submitted with values:', data);
    console.log('Item Name:', data.itemName);
    console.log('Price:', data.price);

    try {
      const response = await api.post('/items', {
        itemName: data.itemName,
        Price: Number(data.price),
      });

      const newItem = response?.data ?? {
        itemName: data.itemName,
        Price: Number(data.price),
      };

      setItems((prevItems) => [
        {
          ...newItem,
          itemName: newItem.itemName ?? data.itemName,
          price: newItem.price ?? newItem.Price ?? Number(data.price),
        },
        ...prevItems,
      ]);
      setTotalItems((prevCount) => prevCount + 1);
      reset();
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add item:', err);
      setSubmitError('Unable to add the item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddForm = () => setShowAddForm(true);
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setSubmitError('');
    reset();
  };

  return (
      <>
      {showAddForm && (
          <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', p: 2, borderRadius: 2 }}>
        <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}>
  {/* FIX: Added spacing={2} to create a gap between fields, and rowSpacing={3} for vertical rows */}
  <Grid container spacing={2} rowSpacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
    
    {/* Left Section: Header Titles */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Box>
        <Typography variant="h6">Add New Item</Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the item details below to add a new record.
        </Typography>
      </Box>
    </Grid>
    
    {/* Middle Section: Empty spacing column */}
    <Grid size={{ xs: 12, md: 4 }}></Grid> 
    
    {/* Right Section: Close Button Action */}
    <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
      <Button 
        variant="text" 
        color="inherit" 
        startIcon={<CloseIcon />} 
        onClick={handleCloseAddForm}
        sx={{border:"3px solid red"}}
      >
        Close
      </Button>
    </Grid>

    {/* Form Fields Section with correct grid item spacing spacing */}
    <Grid size={{ xs: 12, md: 6 }}>
      <RhfTextField name="itemName" control={control} label="Item Name" required fullWidth />
    </Grid>
    
    <Grid size={{ xs: 12, md: 6 }}>
      <RhfTextField
        name="price"
        control={control}
        label="Price"
        type="number"
        required
        fullWidth
      />
    </Grid>
    
    {/* Form Submit Button Action Row */}
    <Grid size={{ xs: 12 }}>
      <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={submitting} sx={{ minWidth: 150, mt: 1 }}>
        {submitting ? 'Saving...' : 'Save Item'}
      </Button>
    </Grid>

    {/* Form Network Error Notification */}
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
      ) }

      <ListingTemplate
        headers={itemHeaders}
        rows={items}
        count={totalItems}
        setCount={setTotalItems}
        elements={items}
        setElements={setItems}
        onAdd={handleOpenAddForm}
        title="List Of Goods & Services"
        subtitle="Manage your products, services, and inventory details."
        loading={loading}
        error={error}
      />
    </>
  );
}
