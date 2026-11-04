import React from 'react';
import { Coins, History, ArrowDownRight, ArrowUpRight, Check, ShieldAlert } from 'lucide-react';
import { CreditHistoryItem } from '../../types';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  history: CreditHistoryItem[];
  onAddCreditsBonus: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen,
  onClose,
  balance,
  history,
  onAddCreditsBonus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#101216] border border-[#232730] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#181a1f] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Saldo de Créditos & Consumo</h3>
              <p className="text-xs text-neutral-400">Modelo transparente por geração bem-sucedida.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#171922] to-[#121319] border border-[#262a36] flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Saldo Disponível na Workspace</span>
            <div className="text-3xl font-bold text-white font-display mt-0.5">
              {balance} <span className="text-xs font-normal text-neutral-400">créditos</span>
            </div>
          </div>

          <button
            onClick={onAddCreditsBonus}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            Recarregar +50 Créditos (Modo Dev)
          </button>
        </div>

        {/* Pricing Table per operation */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Tabela de Custos por Operação (deduz apenas no sucesso)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#14161c] border border-[#20242c] rounded-lg flex items-center justify-between">
              <span className="text-neutral-300">Geração de Oferta Completa</span>
              <span className="font-mono font-bold text-amber-400">5 créditos</span>
            </div>
            <div className="p-2.5 bg-[#14161c] border border-[#20242c] rounded-lg flex items-center justify-between">
              <span className="text-neutral-300">Geração de Página de Vendas</span>
              <span className="font-mono font-bold text-amber-400">5 créditos</span>
            </div>
            <div className="p-2.5 bg-[#14161c] border border-[#20242c] rounded-lg flex items-center justify-between">
              <span className="text-neutral-300">Geração de Entregável Completo</span>
              <span className="font-mono font-bold text-amber-400">5 créditos</span>
            </div>
            <div className="p-2.5 bg-[#14161c] border border-[#20242c] rounded-lg flex items-center justify-between">
              <span className="text-neutral-300">Regeneração de 1 Secção</span>
              <span className="font-mono font-bold text-amber-400">2 créditos</span>
            </div>
            <div className="p-2.5 bg-[#14161c] border border-[#20242c] rounded-lg flex items-center justify-between">
              <span className="text-neutral-300">Exportação PDF & Mineração</span>
              <span className="font-mono font-bold text-emerald-400">Grátis (0 cr)</span>
            </div>
          </div>
        </div>

        {/* History log */}
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Extrato de Consumo Recente</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-48">
            {history.map((tx) => (
              <div
                key={tx.id}
                className="p-2.5 bg-[#14161c] border border-[#20242c] rounded-lg flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {tx.amount > 0 ? (
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-medium text-white">{tx.action}</div>
                    <div className="text-[10px] text-neutral-400">{new Date(tx.date).toLocaleString('pt-PT')}</div>
                  </div>
                </div>
                <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[#181a1f] text-[11px] text-neutral-400 text-center">
          Proteção de cobrança dupla ativa: créditos só são debitados após resposta 200 OK do modelo de IA.
        </div>
      </div>
    </div>
  );
};
