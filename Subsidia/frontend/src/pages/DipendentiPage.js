import { Helmet } from 'react-helmet-async';
import DipendentiPageSection from '../sections/dipendenti/DipendentiPageSection';

export default function DipendentiPage() {
  return (
    <>
      <Helmet>
        <title> Dipendenti | Subsidia</title>
      </Helmet>

      <DipendentiPageSection />
    </>
  );
}
