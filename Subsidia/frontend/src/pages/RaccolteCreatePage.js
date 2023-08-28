// @mui
import Container from '@mui/material/Container';
// components
import { useSettingsContext } from '../components/settings';
import CustomBreadcrumbs from '../components/custom-breadcrumbs';
//
import RaccolteNewEditForm from '../sections/raccolte/raccolte-new-edit-form';

// ----------------------------------------------------------------------

export default function RaccolteCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Aggiungi raccolta"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <RaccolteNewEditForm />
    </Container>
  );
}
