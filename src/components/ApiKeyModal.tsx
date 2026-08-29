import React, { useState, useEffect } from "react";
import { Key, X, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { getApiKey, setApiKey } from "../lib/gemini";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onSaved }: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(keyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Chave da Google Gemini API</h3>
            <p className="text-xs text-slate-400">Necessária para síntese de voz e roteiros</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Para gerar as locuções com vozes neurais e criar roteiros inteligentes no GitHub Pages, informe a sua chave gratuita do <strong>Google AI Studio</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sua Chave de API (Gemini):
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Cole sua chave aqui (ex: AIzaSy...)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck size={16} />
              <span>Salva apenas no seu navegador (localStorage)</span>
            </div>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              Criar chave grátis <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
            >
              {savedSuccess ? (
                <>
                  <Check size={18} /> Salvo!
                </>
              ) : (
                "Salvar Chave"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
