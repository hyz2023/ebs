import './styles/theme.css';
import './styles/app.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { BottomNav } from './components/BottomNav';
import { AssetsPage } from './routes/AssetsPage';
import { LedgerPage } from './routes/LedgerPage';
import { RulesPage } from './routes/RulesPage';
import { TodayPage } from './routes/TodayPage';

export default function App() {
  return (
    <BrowserRouter>
      <main className="app-shell">
        <div className="app-frame">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/rules" element={<RulesPage />} />
          </Routes>
          <BottomNav />
        </div>
      </main>
    </BrowserRouter>
  );
}
