import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Grid, Divider, CardHeader, InputAdornment, Box, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// routes
import { PATH_APP } from '../../routes/paths';
import { useRouter } from '../../routes/hook';
// hooks
import { useBoolean } from '../../hooks/use-boolean';
import { useResponsive } from '../../hooks/use-responsive';
// utils
import { fCurrency } from '../../utils/formatNumber';

// axios
import axios from '../../utils/axios';

// components
import FormProvider, { RHFAutocomplete, RHFTextField, RHFSelect } from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';

// ----------------------------------------------------------------------

RaccolteNewEditForm.propTypes = {
  currentInvoice: PropTypes.object,
};
export default function RaccolteNewEditForm({ currentInvoice }) {
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const loadingSend = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  console.log(currentInvoice);

  const getDistinctValues = useCallback(async () => {
    try {
      const clientResponse = await axios.post('/raccolte/get-distinct-value', {
        value: 'client',
      });
      const productResponse = await axios.post('/raccolte/get-distinct-value', {
        value: 'product',
      });

      setClients(clientResponse.data);
      setProducts(productResponse.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getDistinctValues();
  }, [getDistinctValues]);

  const NewInvoiceSchema = Yup.object().shape({
    date: Yup.mixed().nullable().required('Data mancante'),
    client: Yup.string().required('Cliente mancante'),
    product: Yup.string().required('Prodotto mancante'),
    weight: Yup.number().required('Peso mancante'),
    price: Yup.number().required('Prezzo mancante'),
    status: Yup.string().required('Stato mancante'),
    // not required
    revenue: Yup.number(),
  });

  const defaultValues = useMemo(
    () => ({
      date: currentInvoice ? new Date(currentInvoice?.date) : new Date(),
      client: currentInvoice?.client || '',
      product: currentInvoice?.product || '',
      weight: currentInvoice?.weight || 0,
      price: currentInvoice?.price || 0.0,
      revenue: currentInvoice?.revenue || 0,
      status: currentInvoice?.status || 'Da Pagare',
      note: currentInvoice?.note || '',
    }),
    [currentInvoice]
  );

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();

    try {
      if (!currentInvoice) {
        await axios.post('/raccolte/new-raccolta', {
          data,
        });
        reset();
        enqueueSnackbar('Valore aggiunto correttamente');
      } else {
        await axios.post('/raccolte/edit-raccolta', {
          data,
          id: currentInvoice._id,
        });
        reset();
        enqueueSnackbar('Valore aggiornato correttamente');
      }
      router.push(PATH_APP.raccolte);
    } catch (error) {
      enqueueSnackbar(error.message || error, { variant: 'error' });
    } finally {
      loadingSend.onFalse();
    }
  });

  // Calculate in real-time the teoric revenue
  const priceValue = watch('price');
  const weightValue = watch('weight');
  const calculatedHelperText = `Tot. Teorico : ${fCurrency(priceValue * weightValue)}`;

  return (
    <FormProvider methods={methods}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8}>
          <Card>
            {!mdUp && <CardHeader title="Dettagli" />}

            {/* DATA INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1, mt: 2 }}>
              <Controller
                name="date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Data"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        format: 'dd/MM/yyyy',
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
            {/* CLIENTE INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFAutocomplete
                freeSolo
                size="small"
                name="client"
                label="Cliente"
                options={clients}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value.value}
              />
            </Stack>
            {/* PRODOTTO INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFAutocomplete
                freeSolo
                size="small"
                name="product"
                label="Prodotto"
                options={products}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value.value}
              />
            </Stack>
            {/* PESO INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFTextField
                size="small"
                name="weight"
                label="Peso"
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        Kg
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            {/* PREZZO INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFTextField
                size="small"
                name="price"
                label="Prezzo per Kg"
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        €
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            {/* INCASSATO INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFTextField
                size="small"
                name="revenue"
                label="Totale incassato"
                helperText={calculatedHelperText}
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        €
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            {/* NOTE INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFTextField name="note" label="Note" multiline rows={3} />
            </Stack>
            {/* STATO INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFSelect name="status" label="Stato" size="small">
                <Divider sx={{ borderStyle: 'dashed' }} />
                {['Da Pagare', 'Acconto', 'Pagato'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>
            <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3, p: 3 }}>
              <LoadingButton
                size="small"
                variant="contained"
                color="success"
                loading={loadingSend.value && isSubmitting}
                onClick={handleCreateAndSend}
              >
                {currentInvoice ? 'Modifica' : 'Aggiungi'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
