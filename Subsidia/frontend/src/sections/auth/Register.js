// @mui
import { Stack, Typography } from '@mui/material';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// layouts
import LoginLayout from '../../layouts/login';
//
import AuthRegisterForm from './AuthRegisterForm';

// ----------------------------------------------------------------------

export default function Register() {
  useAuthContext();

  return (
    <LoginLayout>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Registrazione</Typography>
      </Stack>
      <AuthRegisterForm />
    </LoginLayout>
  );
}
