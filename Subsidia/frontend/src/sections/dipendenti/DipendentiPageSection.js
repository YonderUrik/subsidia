import { useCallback, useEffect, useRef, useState } from 'react';

// @mui
import { Container, Grid, Stack } from '@mui/material';

// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

// utils
import axios from '../../utils/axios';

import AggiungiGiornata from './dipendenti-aggiungi-giornata';
import DipendentiTransazioni from './dipendenti-transazioni';
import DipendentiAcconti from './dipendenti-acconti';
import OperaiSummary from './dipendenti-operai-summary';

export default function DipendentiPageSection() {
  const [operaiInfo, setOperaiInfo] = useState([]);
  const [lastTransactions, setLastTransactions] = useState([]);
  const [operaiSummary, setOperaiSummary] = useState([]);
  const settings = useSettingsContext();
  const componentRef = useRef(null);
  const [openedRow, setOpenedRow] = useState(null);

  const getOperaiInfo = useCallback(async () => {
    try {
      const response = await axios.post('/dipendenti/get-operai-info');
      const { data } = response;
      setOperaiInfo(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getLastTransactions = useCallback(async () => {
    try {
      const response = await axios.post('/dipendenti/get-last-giornate');
      const { data } = response;
      setLastTransactions(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getOperaiSummary = useCallback(async () => {
    try {
      const response = await axios.post('/dipendenti/get-operai-summary');
      const { data } = response;
      console.log(data);
      setOperaiSummary(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const refreshAll = () => {
    getOperaiInfo();
    getLastTransactions();
    getOperaiSummary();
  };

  useEffect(() => {
    getOperaiInfo();
    getLastTransactions();
    getOperaiSummary();
  }, [getOperaiInfo, getLastTransactions, getOperaiSummary]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'} ref={componentRef}>
      <CustomBreadcrumbs
        heading="Operai"
        action={
          <AggiungiGiornata
            openedRow={openedRow}
            operai={operaiInfo}
            refreshData={() => {
              setOpenedRow(null)
              refreshAll();
            }}
          />
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack sx={{ mb: 2 }}>
            <DipendentiAcconti
              list={operaiInfo}
              refreshData={() => {
                refreshAll();
              }}
            />
          </Stack>
          <Stack sx={{ mb: 2 }}>
            <OperaiSummary list={operaiSummary} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack>
            <DipendentiTransazioni
              tableData={lastTransactions}
              refreshTable={() => refreshAll()}
              onEdit={(row) => setOpenedRow(row)}
            />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
