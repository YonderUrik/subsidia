import { Helmet } from 'react-helmet-async';
// sections
import { RaccolteListView } from '../sections/raccolte/view';

// ----------------------------------------------------------------------

export default function RaccoltePage() {
  return (
    <>
      <Helmet>
        <title>Raccolte | Subsidia</title>
      </Helmet>
      
      <RaccolteListView />
    </>
  );
}
