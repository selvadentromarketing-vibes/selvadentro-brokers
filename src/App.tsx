import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrokerSignup from './pages/BrokerSignup';
import ClientLanding from './pages/ClientLanding';
import { EN_REGISTRO_ALIAS, ROUTES } from './i18n/lang';

/**
 * Routes (Spanish / English — see src/i18n/lang.ts):
 *   /  ·  /en                    → broker self-registration (generates their
 *                                  personal link)
 *   /registro  ·  /en/register   → client registration landing, reached via the
 *                                  broker's personal link (?ref=<broker-code>)
 *
 * /evento-25-junio/ is NOT a React route — it is the static page for the
 * Carlos Otero training event (formerly the site root), served straight
 * from public/evento-25-junio/ before the SPA fallback kicks in.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.es.home} element={<BrokerSignup />} />
        <Route path={ROUTES.es.registro} element={<ClientLanding />} />
        <Route path={ROUTES.en.home} element={<BrokerSignup />} />
        <Route path={ROUTES.en.registro} element={<ClientLanding />} />
        <Route path={EN_REGISTRO_ALIAS} element={<ClientLanding />} />
        {/* Anything unknown → broker signup in that language (keeps old deep links alive) */}
        <Route path="/en/*" element={<BrokerSignup />} />
        <Route path="*" element={<BrokerSignup />} />
      </Routes>
    </Router>
  );
}

export default App;
