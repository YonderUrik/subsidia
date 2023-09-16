import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Input, { inputClasses } from '@mui/material/Input';
import { FormControl, MenuItem, Select, OutlinedInput, Chip, Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import axios from '../../utils/axios';
import { useSnackbar } from '../../components/snackbar';
// ----------------------------------------------------------------------

const STEP = 50;

const MIN_AMOUNT = 0;

const MAX_AMOUNT = 1000;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
// ----------------------------------------------------------------------

DipendentiAcconti.propTypes = {
  list: PropTypes.array,
  refreshData: PropTypes.func,
};
export default function DipendentiAcconti({ list, refreshData }) {
  const [autoWidth, setAutoWidth] = useState(24);
  const [amount, setAmount] = useState(0);
  const confirm = useBoolean();

  useEffect(() => {
    if (amount) {
      handleAutoWidth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const handleAutoWidth = useCallback(() => {
    const getNumberLength = amount.toString().length;
    setAutoWidth(getNumberLength * 24);
  }, [amount]);

  const handleChangeSlider = useCallback((event, newValue) => {
    setAmount(newValue);
  }, []);

  const handleChangeInput = useCallback((event) => {
    setAmount(Number(event.target.value));
  }, []);

  const handleBlur = useCallback(() => {
    if (amount < 0) {
      setAmount(0);
    } else if (amount > MAX_AMOUNT) {
      setAmount(MAX_AMOUNT);
    }
  }, [amount]);

  const [personName, setPersonName] = useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const renderCarousel = (
    <Box sx={{ position: 'relative' }}>
      <FormControl sx={{ m: 1, width: '100%' }}>
        <Select
          multiple
          size="small"
          fullWidth
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {list.map((operaio) => (
            <MenuItem key={operaio.name} value={operaio.name}>
              {operaio.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const renderInput = (
    <Stack spacing={3}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        Inserisci importo
      </Typography>

      <InputAmount
        amount={amount}
        onBlur={handleBlur}
        autoWidth={autoWidth}
        onChange={handleChangeInput}
      />

      <Slider
        value={typeof amount === 'number' ? amount : 0}
        valueLabelDisplay="auto"
        step={STEP}
        marks
        min={MIN_AMOUNT}
        max={MAX_AMOUNT}
        onChange={handleChangeSlider}
      />

      <Button
        size="large"
        color="success"
        variant="contained"
        disabled={amount === 0 || personName.length === 0}
        onClick={confirm.onTrue}
      >
        Aggiungi acconto
      </Button>
    </Stack>
  );

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
        }}
      >
        <CardHeader title="Acconto rapido" />

        <Stack sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Seleziona operai
            </Typography>
          </Stack>

          {renderCarousel}

          {renderInput}
        </Stack>
      </Card>

      <ConfirmTransferDialog
        amount={amount}
        onBlur={handleBlur}
        open={confirm.value}
        autoWidth={autoWidth}
        onClose={confirm.onFalse}
        onRefresh={() => {
          setPersonName([])
          confirm.onFalse();
          refreshData();
        }}
        contactInfo={personName}
        onChange={handleChangeInput}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function InputAmount({ autoWidth, amount, onBlur, onChange, sx, ...other }) {
  return (
    <Stack direction="row" justifyContent="center" spacing={1} sx={sx}>
      <Typography variant="h5">€</Typography>

      <Input
        disableUnderline
        size="small"
        value={amount}
        onChange={onChange}
        onBlur={onBlur}
        inputProps={{ step: STEP, min: MIN_AMOUNT, max: MAX_AMOUNT, type: 'number' }}
        sx={{
          [`& .${inputClasses.input}`]: {
            p: 0,
            typography: 'h3',
            textAlign: 'center',
            width: autoWidth,
          },
        }}
        {...other}
      />
    </Stack>
  );
}

InputAmount.propTypes = {
  amount: PropTypes.number,
  autoWidth: PropTypes.number,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  sx: PropTypes.object,
};

// ----------------------------------------------------------------------

function ConfirmTransferDialog({
  open,
  amount,
  autoWidth,
  contactInfo,
  onClose,
  onBlur,
  onChange,
  onRefresh,
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const confirmAcconto = async () => {
    setIsConfirming(true);
    try {
      await axios.post('/dipendenti/set-new-acconto', {
        operai: contactInfo,
        amount,
      });
      enqueueSnackbar('Acconto aggiunto con successo');
      onRefresh();
    } catch (error) {
      enqueueSnackbar(error.message || error, { variant: 'error' });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>Aggiungi acconto a</DialogTitle>

      <Stack spacing={3} sx={{ px: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {contactInfo.map((operaio) => (
            <ListItemText
              key={operaio}
              primary={operaio}
              secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
            />
          ))}
        </Stack>

        <InputAmount
          onBlur={onBlur}
          onChange={onChange}
          autoWidth={autoWidth}
          amount={amount}
          disableUnderline={false}
          sx={{ justifyContent: 'flex-end' }}
        />
      </Stack>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Annulla
        </Button>

        <LoadingButton
          loading={isConfirming}
          variant="contained"
          color="success"
          disabled={amount === 0}
          onClick={confirmAcconto}
        >
          Conferma
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

ConfirmTransferDialog.propTypes = {
  amount: PropTypes.number,
  autoWidth: PropTypes.number,
  contactInfo: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  onRefresh: PropTypes.func,
  open: PropTypes.bool,
};
