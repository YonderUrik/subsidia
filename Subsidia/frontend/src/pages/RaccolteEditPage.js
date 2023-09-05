import { useCallback, useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { useParams } from 'src/routes/hook';
// hooks

// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import RaccolteNewEditForm from '../sections/raccolte/raccolte-new-edit-form';
// utils
import axios from '../utils/axios';

// ----------------------------------------------------------------------

export default function RaccolteEditPage() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const getData = useCallback(async () => {
    try {
      const response = await axios.post('/raccolte/get-single-doc', {
        id,
      });
      setCurrentDoc(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    getData();
  }, [getData]);

  const [currentDoc, setCurrentDoc] = useState(null);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Modifica"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentDoc && <RaccolteNewEditForm currentInvoice={currentDoc} />}
    </Container>
  );
}
