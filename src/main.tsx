import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProvedorAula } from './estado';
import './styles/global.css';
import 'katex/dist/katex.min.css';

createRoot(document.getElementById('raiz')!).render(
  <BrowserRouter>
    <ProvedorAula>
      <App />
    </ProvedorAula>
  </BrowserRouter>,
);
