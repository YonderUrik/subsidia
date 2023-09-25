import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';

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

import { useBoolean } from '../../hooks/use-boolean';
import axios from '../../utils/axios';
import { useSnackbar } from '../../components/snackbar';
import Iconify from '../../components/iconify';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFRadioGroup,
} from '../../components/hook-form';

NewTransaction.propTypes = {
  transaction: PropTypes.object,
  refreshData: PropTypes.func,
};
export default function NewTransaction({ refreshData, transaction }) {
  const isOpen = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [contiList, setContiList] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);

  const handleCLose = () => {
    isOpen.onFalse();
    reset();
    refreshData();
  };

  const transactionSchema = Yup.object().shape({
    date: Yup.mixed().nullable().required('Data mancante'),
    conto: Yup.string().required('Conto mancante'),
    mainCategory: Yup.string().required('Categoria principale mancante'),
    subCategory: Yup.string().required('Categoria secondaria mancante'),
    type: Yup.number().min(0).max(1).required('Tipologia transazione obbligatoria'),
    amount: Yup.number().min(1).required('Somma necessaria'),
  });

  const defaultValues = useMemo(
    () => ({
      date: new Date(),
      conto: '',
      mainCategory: '',
      subCategory: '',
      type: 0,
      amount: 0,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleTransaction = handleSubmit(async (data) => {
    try {
      if (transaction) {
        await axios.post('/cashflow/edit-transaction', {
          data,
          id: transaction._id,
        });
        handleCLose();
        enqueueSnackbar('Transazione modificata');
        refreshData();
      } else {
        await axios.post('/cashflow/add-transaction', {
          data,
        });
        handleCLose();
        enqueueSnackbar('Transazione aggiunta');
        refreshData();
      }
    } catch (error) {
      enqueueSnackbar(error.message || error, { variant: 'error' });
    }
  });

  return (
    <>
      <Button
        onClick={isOpen.onTrue}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        Nuova transazione
      </Button>
      <Dialog maxWidth="sm" fullWidth open={isOpen.value || transaction} onClose={handleCLose}>
        <DialogTitle>Aggiungi transazione</DialogTitle>
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
            {/* CONTO INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFAutocomplete
                name="conto"
                label="Conto"
                freeSolo
                disableCloseOnSelect
                options={contiList}
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
                defaultValue={defaultValues.conto} // Set the initial value
              />
            </Stack>
            {/* MAIN CATEGORY INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFAutocomplete
                name="mainCategory"
                label="Categoria Princiale"
                disableCloseOnSelect
                options={mainCategories}
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
                defaultValue={defaultValues.mainCategory} // Set the initial value
              />
            </Stack>
            {/* SUB CATEGORY INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFAutocomplete
                name="subCategory"
                label="SottoCategoria"
                disableCloseOnSelect
                options={subCategoriesList}
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
                defaultValue={defaultValues.subCategory} // Set the initial value
              />
            </Stack>
            {/* TYPE INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFRadioGroup
                row
                name="type"
                label="Tipologia"
                spacing={4}
                options={[
                  { value: 0, label: 'Entrata' },
                  { value: 1, label: 'Uscita' },
                ]}
              />
            </Stack>
            {/* PAY INPUT */}
            <Stack spacing={3} sx={{ px: 3, py: 1 }}>
              <RHFTextField
                name="amount"
                label="Somma"
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCLose} size="small" variant="soft" color="inherit">
              Chiudi
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              color="success"
              loading={isSubmitting}
              onClick={handleTransaction}
            >
              {transaction ? 'Modifica' : 'Aggiungi'}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
}
