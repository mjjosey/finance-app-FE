import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { TOKEN_STORAGE_KEY, setAuthToken } from '../../api/axios';
import RhfTextField from '../../components/RhfTextField';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    return <Navigate to="/items" replace />;
  }

  const onSubmit = async (values) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/signin', {
        username: values.username,
        password: values.password,
      });
      const responseToken =
        response?.data?.token ??
        response?.data?.accessToken ??
        response?.data?.jwtToken ??
        response?.data?.data?.token ??
        null;

      if (!responseToken) {
        throw new Error('Token not found in login response');
      }

      setAuthToken(responseToken);
      const redirectPath = location.state?.from || '/items';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
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
          'radial-gradient(circle at 10% 20%, rgba(30, 64, 175, 0.22), transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.24), transparent 35%), linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
      }}
    >
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 440, p: 4, borderRadius: 3 }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue managing your inventory and transactions.
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <RhfTextField control={control} name="username" label="Username" required />
          <RhfTextField
            control={control}
            name="password"
            label="Password"
            type="password"
            required
          />

          <Button type="submit" variant="contained" size="large" disabled={loading || isSubmitting}>
            {loading || isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            New here?{' '}
            <Link component={RouterLink} to="/signup">
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
