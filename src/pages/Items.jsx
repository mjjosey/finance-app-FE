import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Grid, Paper, Snackbar, Stack, Typography } from '@mui/material';
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
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

    try {
      if (selectedItem) {
        const response = await api.put(`/items/${selectedItem.itemID}`, {
          itemName: data.itemName,
          Price: Number(data.price),
        });

        const updatedItem = response?.data ?? {
          ...selectedItem,
          itemName: data.itemName,
          Price: Number(data.price),
        };

        setItems((prevItems) =>
          prevItems.map((item) => {
            const currentId = item.itemID ?? item.id;
            const selectedId = selectedItem.itemID ?? selectedItem.id;
            return currentId === selectedId
              ? {
                  ...item,
                  ...updatedItem,
                  itemName: updatedItem.itemName ?? item.itemName,
                  price: updatedItem.price ?? updatedItem.Price ?? item.price,
                }
              : item;
          }),
        );
      } else {
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
      }

      setSnackbarMessage(selectedItem ? 'Item updated successfully.' : 'Item added successfully.');
      setSnackbarOpen(true);
      reset({ itemName: '', price: '' });
      setSelectedItem(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to save item:', err);
      setSubmitError(selectedItem ? 'Unable to update the item. Please try again.' : 'Unable to add the item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddForm = () => {
    setSelectedItem(null);
    reset({ itemName: '', price: '' });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    reset({
      itemName: item?.itemName ?? item?.name ?? '',
      price: item?.price ?? item?.Price ?? '',
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAddForm = () => {
    setSelectedItem(null);
    setShowAddForm(false);
    setSubmitError('');
    reset({ itemName: '', price: '' });
  };

  const handleDeleteItem = async (item) => {
    const itemId = item?.itemID;
    if (!itemId) return;

    try {
      await api.delete(`/items/${itemId}`);
      setItems((prevItems) => prevItems.filter((currentItem) => currentItem.itemID !== itemId));
      setTotalItems((prevCount) => Math.max(0, prevCount - 1));
      setSnackbarMessage('Item deleted successfully.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Unable to delete the item. Please try again.');
    }
  };
  const handleChangePage = async (event, newPage,rowsPerPage) => {
    console.log(newPage,"new page");
        try {
        const response = await api.get(`http://localhost:8080/items?pageNumber=${newPage}&pageSize=${rowsPerPage}&sortBy=itemName&sortOrder=asc`);
        console.log(response, 'response');
        
        const payload = response?.data?.content ??  [];
        const normalizedItems = Array.isArray(payload) ? payload : [];
        setCount(response?.data?.totalElements ?? 0);
        setElements(
          normalizedItems.map((item) => ({
            ...item,
            itemName: item.itemName,
            price: item.Price
          })),
        );
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } 
    setPage(newPage);
  };
  const handleChangeRowsPerPage = async (event) => {
    console.log("oooooooooo");
    
    setPage(0);
    setRowsPerPage(event.target.value);
          try {
        const response = await api.get(`http://localhost:8080/items?pageNumber=0&pageSize=${event.target.value}&sortBy=itemName&sortOrder=asc`);
        console.log(response, 'response');
        
        const payload = response?.data?.content ??  [];
        const normalizedItems = Array.isArray(payload) ? payload : [];
         setCount(response?.data?.totalElements ?? 0);
        setElements(
          normalizedItems.map((item) => ({
            ...item,
            itemName: item.itemName,
            price: item.Price
          })),
        );
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } 
  };

  return (
      <>
      {showAddForm && (
          <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', p: 2, borderRadius: 2 }}>
        <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}>
  <Grid container spacing={2} rowSpacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
    
    <Grid size={{ xs: 12, md: 6 }}>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}></Grid> 
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
    
    <Grid size={{ xs: 12 }}>
      <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={submitting} sx={{ minWidth: 150, mt: 1 }}>
        {submitting ? 'Saving...' : selectedItem ? 'Update Item' : 'Save Item'}
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
      ) }

      <ListingTemplate
        headers={itemHeaders}
        rows={items}
        count={totalItems}
        setCount={setTotalItems}
        pageName="Item"
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        setElements={setItems}
        onAdd={handleOpenAddForm}
        onView={handleViewItem}
        onDelete={handleDeleteItem}
        title="List Of Goods & Services"
        loading={loading}
        error={error}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
