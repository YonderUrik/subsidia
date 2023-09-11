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

export default function DipendentiPageSection() {
  const [operaiInfo, setOperaiInfo] = useState([]);
  const [lastTransactions, setLastTransactions] = useState([]);
  const settings = useSettingsContext();
  const componentRef = useRef(null);

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

  useEffect(() => {
    getOperaiInfo();
    getLastTransactions();
  }, [getOperaiInfo, getLastTransactions]);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'} ref={componentRef}>
      <CustomBreadcrumbs
        heading="Operai"
        action={<AggiungiGiornata operai={operaiInfo} />}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <DipendentiTransazioni tableData={lastTransactions} />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
