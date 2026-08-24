import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrokerSignup from './pages/BrokerSignup';
import ClientLanding from './pages/ClientLanding';

/**
 * Routes:
 *   /           → broker self-registration (generates their personal link)
 *   /registro   → client registration landing, reached via the broker's
 *                 personal link (/registro?ref=<broker-code>)
 *
 * /evento-25-junio/ is NOT a React route — it is the static page for the
 * Carlos Otero training event (formerly the site root), served straight
 * from public/evento-25-junio/ before the SPA fallback kicks in.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrokerSignup />} />
        <Route path="/registro" element={<ClientLanding />} />
        {/* Anything unknown → broker signup (keeps old deep links alive) */}
        <Route path="*" element={<BrokerSignup />} />
      </Routes>
    </Router>
  );
}

export default App;
