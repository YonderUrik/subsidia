import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from '../../auth/useAuthContext';
// components
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

export default function AuthResetPasswordForm() {
  const navigate = useNavigate();

  const { reset_password } = useAuthContext();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email richiesta'),
  });

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const resp = await reset_password(data.email);
      if(resp.status === 200){
        navigate('/verify-forgot', { state: { email : data.email } });
      }
    } catch (error) {

      setError('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {!!errors.afterSubmit && <Alert sx={{my:2}} severity="error">{errors.afterSubmit.message}</Alert>}
      <RHFTextField type='email' name="email" label="Email" />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitSuccessful || isSubmitting}
        sx={{
          my:2,
          bgcolor: 'text.primary',
          color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          '&:hover': {
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          },
        }}
      >
        Invia richiesta
      </LoadingButton>
    </FormProvider>
  );
}
