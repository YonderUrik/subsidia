import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH } from '../../routes/paths';
import { useAuthContext } from '../../auth/useAuthContext';

// components
import FormProvider, { RHFCodes } from '../../components/hook-form';

// ----------------------------------------------------------------------

export default function AuthVerifyCodeForm() {
  const navigate = useNavigate();

  const { verify_forgot } = useAuthContext();

  const location = useLocation();
  const {username} = location.state || {};

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Codice obbligatorio'),
    code2: Yup.string().required('Codice obbligatorio'),
    code3: Yup.string().required('Codice obbligatorio'),
    code4: Yup.string().required('Codice obbligatorio'),
    code5: Yup.string().required('Codice obbligatorio'),
    code6: Yup.string().required('Codice obbligatorio'),
  });

  const defaultValues = {
    code1: '',
    code2: '',
    code3: '',
    code4: '',
    code5: '',
    code6: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const code = Object.values(data).join('');
      const resp = await verify_forgot(code, username);
      if  (resp.status === 200) { 
        navigate(PATH_AUTH.register, {state: {username}});
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFCodes keyName="code" inputs={['code1', 'code2', 'code3', 'code4', 'code5', 'code6']} />

        {(!!errors.code1 ||
          !!errors.code2 ||
          !!errors.code3 ||
          !!errors.code4 ||
          !!errors.code5 ||
          !!errors.code6) && (
          <FormHelperText error sx={{ px: 2 }}>
            Codice obbligatorio
          </FormHelperText>
        )}

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Verifica
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
