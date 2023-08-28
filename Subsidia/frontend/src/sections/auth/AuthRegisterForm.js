import { useState } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useLocation, useNavigate } from 'react-router-dom';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

export default function AuthRegisterForm() {
  const { register } = useAuthContext();

  const navigate = useNavigate();

  const location = useLocation();
  const { username } = location.state || {};

  const [showPassword, setShowPassword] = useState(false);

  const VerifyPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/^(?=.*[!@#$%^&*])/, 'Password must contain at least one special character [!@#$%^&*]')
      .matches(/^(?=.*[0-9])/, 'Password must contain at least one number')
      .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const defaultValues = {
    confirmPassword: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(VerifyPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const resp = await register(username, data.password);
      if (resp.status === 200) {
        navigate('/verify', { state: { username } });
      }
    } catch (error) {
      reset();

      setError('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ my: 2 }}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitSuccessful || isSubmitting}
        sx={{
          bgcolor: 'text.primary',
          color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          '&:hover': {
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          },
        }}
      >
        Conferma
      </LoadingButton>
    </FormProvider>
  );
}
