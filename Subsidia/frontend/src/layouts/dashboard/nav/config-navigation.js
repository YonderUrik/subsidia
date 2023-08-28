// routes
import { PATH_APP } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify/Iconify';

// ----------------------------------------------------------------------

const icon = (name) => <Iconify icon={`${name}`} />;
const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: '',
    items: [{ title: 'Home', path: PATH_APP.home, icon: icon('mdi:home') }],
  },
];

export default navConfig;
