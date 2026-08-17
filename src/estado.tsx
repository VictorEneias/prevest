/**
 * O estado que atravessa a aula inteira: o modo de exibição, o tamanho da fonte
 * e a pilha de painéis.
 *
 * O modo continua sendo um data-attribute no <html>, igual era antes, porque
 * quase todo o efeito dele é CSS e assim o painel herda o modo de graça. O que
 * o React resolve aqui é o resto: reabrir as camadas quando o modo troca e
 * empilhar painel sem iframe.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Modo = 'estudo' | 'aula';
export type Tamanho = 'normal' | 'grande' | 'enorme';

/** Em que modo cada camada nasce aberta. Trocar de modo só abre e fecha
 *  <details>, então o aluno pode reabrir uma camada no clique durante a aula. */
export const CAMADAS_ABERTAS: Record<Modo, string[]> = {
  estudo: ['resolucao', 'pensamento', 'erros'],
  aula: [],
};

const TAMANHOS: Tamanho[] = ['normal', 'grande', 'enorme'];

export interface ItemPilha {
  id: string;
  titulo: string;
}

interface Estado {
  modo: Modo;
  trocarModo: (m: Modo) => void;
  tamanho: Tamanho;
  girarTamanho: () => void;
  pilha: ItemPilha[];
  abrirConceito: (id: string, titulo: string) => void;
  fecharPainel: () => void;
  fecharTudo: () => void;
}

const Ctx = createContext<Estado | null>(null);

const lerGuardado = <T,>(chave: string, padrao: T): T => {
  try {
    return (localStorage.getItem(chave) as T | null) ?? padrao;
  } catch {
    return padrao;
  }
};

export function ProvedorAula({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<Modo>(() => lerGuardado('modo', 'estudo'));
  const [tamanho, setTamanho] = useState<Tamanho>(() => lerGuardado('tamanho', 'normal'));
  const [pilha, setPilha] = useState<ItemPilha[]>([]);

  useEffect(() => {
    document.documentElement.dataset.modo = modo;
    try {
      localStorage.setItem('modo', modo);
    } catch {}
  }, [modo]);

  useEffect(() => {
    document.documentElement.dataset.tamanho = tamanho;
    try {
      localStorage.setItem('tamanho', tamanho);
    } catch {}
  }, [tamanho]);

  const girarTamanho = useCallback(() => {
    setTamanho((t) => TAMANHOS[(TAMANHOS.indexOf(t) + 1) % TAMANHOS.length]);
  }, []);

  const abrirConceito = useCallback((id: string, titulo: string) => {
    setPilha((p) => [...p, { id, titulo }]);
  }, []);
  const fecharPainel = useCallback(() => setPilha((p) => p.slice(0, -1)), []);
  const fecharTudo = useCallback(() => setPilha([]), []);

  /* Esc fecha o painel do topo; Alt+1, Alt+2 e Alt+Z são os atalhos de aula. */
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPilha((p) => (p.length ? p.slice(0, -1) : p));
        return;
      }
      if (!e.altKey) return;
      if (e.key === '1') {
        e.preventDefault();
        setModo('estudo');
      } else if (e.key === '2') {
        e.preventDefault();
        setModo('aula');
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        girarTamanho();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [girarTamanho]);

  const valor = useMemo(
    () => ({
      modo,
      trocarModo: setModo,
      tamanho,
      girarTamanho,
      pilha,
      abrirConceito,
      fecharPainel,
      fecharTudo,
    }),
    [modo, tamanho, girarTamanho, pilha, abrirConceito, fecharPainel, fecharTudo],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAula() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAula() precisa estar dentro do <ProvedorAula>.');
  return v;
}
