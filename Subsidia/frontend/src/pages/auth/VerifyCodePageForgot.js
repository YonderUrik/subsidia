import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
// sections
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeFormForgot';
// assets
import { EmailInboxIcon } from '../../assets/icons';

// ----------------------------------------------------------------------

export default function VerifyCodePageForgot() {
  return (
    <>
      <Helmet>
        <title> Verifica codice | ConveyApps</title>
      </Helmet>

      <EmailInboxIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>
        Controlla la tua mail!
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        Abbiamo inviato un codice a 6 cifre alla tua casella di posta, insersci il codice qui sotto per confermare il reset della password.
      </Typography>

      <AuthVerifyCodeForm />

      <Link
        component={RouterLink}
        to={PATH_AUTH.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          mx: 'auto',
          my:2,
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:chevron-left-fill" width={16} />
        Ritorna al login
      </Link>
    </>
  );
}
