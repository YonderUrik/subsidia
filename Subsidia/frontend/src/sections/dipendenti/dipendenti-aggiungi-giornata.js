import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';

// @mui
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// components
import Iconify from '../../components/iconify';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFRadioGroup,
} from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';

// utils
import axios from '../../utils/axios';

import { useBoolean } from '../../hooks/use-boolean';

AggiungiGiornata.propTypes = {
  operai: PropTypes.array,
  openedRow: PropTypes.object,
  refreshData: PropTypes.func,
};
export default function AggiungiGiornata({ operai, refreshData, openedRow }) {
  const isOpen = useBoolean();
  const loadingSend = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const handleCLose = () => {
    isOpen.onFalse();
    reset();
    refreshData();
  };

  const schema = Yup.object().shape({
    date: Yup.mixed().nullable().required('Data mancante'),
    operai: Yup.array().min(1).required('Aggiungi gli operai'),
    pay: Yup.number().min(1).required('Aggiungi paga'),
    type: Yup.number().min(0).max(1).required('Aggiungi paga'),
  });

  const defaultValues = useMemo(
    () => ({
      operai: openedRow?.opeario || [],
      date: openedRow ? new Date(openedRow.date) : new Date(),
      type: openedRow?.type || 1,
      pay: openedRow?.pay || 50,
      activity: openedRow?.activity || '',
    }),
    [openedRow]
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset({
      operai: openedRow ? [openedRow.operaio] : [],
      date: openedRow ? new Date(openedRow.date) : new Date(),
      type: openedRow?.type || 1,
      pay: openedRow?.pay || 50,
      activity: openedRow?.activity || '',
    });
  }, [openedRow, reset]);

  const handleAddGiornata = handleSubmit(async (data) => {
    loadingSend.onTrue();

    try {
      if (openedRow) {
        await axios.post('/dipendenti/edit-giornata-operai', {
          data,
          id : openedRow._id
        });
        handleCLose();
        enqueueSnackbar('Giornata modificata');
        refreshData();
      } else {
        await axios.post('/dipendenti/set-giornata-operai', {
          data,
        });
        handleCLose();
        enqueueSnackbar('Giornata aggiunta');
        refreshData();
      }
    } catch (error) {
      enqueueSnackbar(error.message || error, { variant: 'error' });
    } finally {
      loadingSend.onFalse();
    }
  });

  return (
    <>
      <Button
        onClick={isOpen.onTrue}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        Aggiungi Giornata
      </Button>
      <Dialog maxWidth="sm" fullWidth open={isOpen.value || openedRow} onClose={handleCLose}>
        <DialogTitle>Aggiungi giornata</DialogTitle>
        <FormProvider methods={methods}>
          <DialogContent>
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
            {/* OPERAI INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFAutocomplete
                name="operai"
                label="Operai"
                multiple
                freeSolo
                disableCloseOnSelect
                options={operai.map((option) => option.name)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      color="info"
                      variant="soft"
                    />
                  ))
                }
                defaultValue={defaultValues.operai} // Set the initial value
              />
            </Stack>
            {/* TYPE INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFRadioGroup
                row
                name="type"
                label="Tipo"
                spacing={4}
                options={[
                  { value: 0, label: 'Mezza giornata' },
                  { value: 1, label: 'Giornata Intera' },
                ]}
              />
            </Stack>
            {/* PAY INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFTextField
                size="small"
                name="pay"
                label="Paga"
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
            {/* ACTIVITY INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFTextField name="activity" label="Attività" multiline rows={3} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCLose} size="small" variant="soft" color="inherit">
              Chiudi
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              color="success"
              loading={loadingSend.value && isSubmitting}
              onClick={handleAddGiornata}
            >
              {openedRow ? 'Modifica' : 'Aggiungi'}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
}
