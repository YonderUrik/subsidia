// @mui
import { Stack, Typography } from '@mui/material';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// layouts
import LoginLayout from '../../layouts/login';
//
import AuthLoginForm from './AuthLoginForm';

// ----------------------------------------------------------------------

export default function Login() {
  useAuthContext();

  return (
    <LoginLayout>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Accedi a Subsidia</Typography>
      </Stack>
      <AuthLoginForm />
    </LoginLayout>
  );
}
