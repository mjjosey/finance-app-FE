import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import api, { TOKEN_STORAGE_KEY } from '../../api/axios';
import RhfTextField from '../../components/RhfTextField';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    return <Navigate to="/items" replace />;
  }

  const onSubmit = async (values) => {
    setError('');
    setSuccessMessage('');

    if (values.password !== values.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/signup', {
        username: values.username,
        email: values.email,
        password: values.password,
      });
      setSuccessMessage('Signup successful. Please login with your account.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 900);
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background:
          'radial-gradient(circle at 15% 30%, rgba(5, 150, 105, 0.22), transparent 40%), radial-gradient(circle at 80% 75%, rgba(245, 158, 11, 0.2), transparent 35%), linear-gradient(140deg, #f0fdf4 0%, #dcfce7 100%)',
      }}
    >
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 3 }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Signup once and access all billing modules from one place.
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

          <RhfTextField control={control} name="email" label="Email" type="email" required />
          <RhfTextField control={control} name="username" label="Username" required />
          <RhfTextField
            control={control}
            name="password"
            label="Password"
            type="password"
            required
          />
          <RhfTextField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            required
          />

          <Button type="submit" variant="contained" size="large" disabled={loading || isSubmitting}>
            {loading || isSubmitting ? 'Creating account...' : 'Sign Up'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
