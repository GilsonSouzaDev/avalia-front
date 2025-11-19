import { Cabecalho } from "./Cabecalho";
import { Pergunta } from "./Pergunta";

export interface Avaliacao {
  cabecalho: Cabecalho;
  perguntas: Pergunta[];
}

export interface AvaliacaoDraft {
  disciplinaId?: number | null;
  disciplinaNome?: string;
  isMista?: boolean;
  quantidadePerguntas?: number;
  questoesSelecionadas: Pergunta[];
  cabecalho?: Partial<Cabecalho>;
}
