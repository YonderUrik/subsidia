import { Helmet } from 'react-helmet-async';
import OverviewCashFlowView from '../sections/cashflow/view/overview-cashflow-view';

export default function CashFlowPage() {
    return (
        <>
          <Helmet>
            <title>CashFlow | Subsidia</title>
          </Helmet>
    
          <OverviewCashFlowView />
        </>
      );
}
