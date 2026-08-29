import React from "react";
import { VINHETA_TEMPLATES } from "../data/vinhetaData";
import { VinhetaTemplate } from "../types";
import { X, Sparkles, BookOpen, Check, Play } from "lucide-react";

interface VinhetaTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: VinhetaTemplate) => void;
}

export function VinhetaTemplatesModal({
  isOpen,
  onClose,
  onApplyTemplate,
}: VinhetaTemplatesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Modelos Prontos de Vinhetas de Carro de Som
              </h2>
              <p className="text-xs text-slate-400">
                Selecione um roteiro consagrado para preencher o texto e configurar a locução
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {VINHETA_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-slate-950/60 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl p-4 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{tmpl.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {tmpl.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-amber-300/90 bg-amber-950/60 border border-amber-800/40 px-2 py-0.2 rounded-full">
                        {tmpl.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Locutor: <strong className="text-slate-300">{tmpl.voice}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onApplyTemplate(tmpl);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  Usar Modelo
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 font-mono">
                "{tmpl.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
