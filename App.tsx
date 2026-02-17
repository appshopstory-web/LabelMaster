
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Printer, 
  Settings, 
  Type as FontIcon, 
  Table as TableIcon, 
  Barcode as BarcodeIcon, 
  QrCode, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download,
  Layout,
  Info,
  Building2,
  Mail,
  Phone,
  Image as ImageIcon,
  FileJson,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Palette,
  Library,
  Save,
  Clock,
  ExternalLink,
  ArrowUp,
  Upload,
  Globe,
  Maximize2,
  ArrowRightLeft,
  MoveVertical,
  Type,
  Cloud,
  CloudOff,
  RefreshCw,
  Copy,
  Terminal,
  Github,
  LogOut,
  UserCircle
} from 'lucide-react';
import { LabelConfig, DEFAULT_CONFIG, PrinterModel, NutritionItem, LabelStyle, SavedTemplate, GithubUser } from './types';
import LabelPreview from './components/LabelPreview';
import { improveLabelContent, generateNutritionTable } from './services/geminiService';
import { supabase } from './lib/supabase';

interface ValidationError {
  field: string;
  tab: 'dims' | 'product' | 'company' | 'codes' | 'nutrition' | 'templates';
  message: string;
  type: 'error' | 'warning';
}

const getBarcodeStandard = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 13) return 'EAN-13';
  if (digits.length === 8) return 'EAN-8';
  if (digits.length === 12) return 'UPC-A';
  return 'CODE128';
};

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const SQL_SETUP = `-- Script SQL para Supabase
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  config jsonb not null,
  created_at timestamp with time zone default now()
);
alter table public.templates enable row level security;
create policy "Acesso público" on public.templates for all using (true) with check (true);`;

const App: React.FC = () => {
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dims' | 'product' | 'company' | 'codes' | 'nutrition' | 'templates'>('dims');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const isCloudEnabled = !!supabase;

  const fetchTemplates = async () => {
    setIsSyncing(true);
    setDbError(null);
    
    // Tenta carregar do local primeiro para ser instantâneo
    const storedTemplates = localStorage.getItem('labelmaster_templates');
    if (storedTemplates) {
      try {
        setSavedTemplates(JSON.parse(storedTemplates));
      } catch (e) {
        console.error("Erro no local storage", e);
      }
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('relation "templates" does not exist')) {
            setDbError('Tabela "templates" não encontrada.');
          } else {
            setDbError(error.message);
          }
          throw error;
        }

        if (data) {
          const cloudTemplates: SavedTemplate[] = data.map(item => ({
            id: item.id,
            name: item.name,
            date: new Date(item.created_at).toLocaleDateString('pt-BR'),
            config: item.config
          }));
          setSavedTemplates(cloudTemplates);
        }
      } catch (err) {
        console.warn("Status DB:", err);
      }
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    fetchTemplates();
    const storedDraft = localStorage.getItem('labelmaster_current_draft');
    if (storedDraft) {
      try {
        const parsedDraft = JSON.parse(storedDraft);
        setConfig({ ...DEFAULT_CONFIG, ...parsedDraft });
      } catch (e) {
        console.error("Erro ao carregar rascunho", e);
      }
    }

    const storedUser = localStorage.getItem('labelmaster_github_user');
    if (storedUser) {
      try {
        setGithubUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao carregar usuário GitHub", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('labelmaster_current_draft', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('labelmaster_templates', JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  useEffect(() => {
    if (githubUser) {
      localStorage.setItem('labelmaster_github_user', JSON.stringify(githubUser));
    } else {
      localStorage.removeItem('labelmaster_github_user');
    }
  }, [githubUser]);

  const updateConfig = (updates: Partial<LabelConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleGitHubLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUsers = [
        { login: 'label_pro_dev', name: 'Dev Master', avatar_url: 'https://github.com/identicons/jason.png', html_url: '#' },
        { login: 'design_expert', name: 'Creative Mind', avatar_url: 'https://github.com/identicons/gabriel.png', html_url: '#' }
      ];
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      setGithubUser(randomUser);
      setIsLoading(false);
      setShowAccountMenu(false);
    }, 1200);
  };

  const handleLogout = () => {
    setGithubUser(null);
    setShowAccountMenu(false);
  };

  const addNutritionItem = () => {
    const newItem: NutritionItem = { name: 'Novo Nutriente', amount: '0g', dailyValue: '0%' };
    updateConfig({ nutrition: [...config.nutrition, newItem] });
  };

  const removeNutritionItem = (index: number) => {
    updateConfig({ 
      nutrition: config.nutrition.filter((_, i) => i !== index) 
    });
  };

  const updateNutritionItem = (index: number, updates: Partial<NutritionItem>) => {
    const newNutrition = [...config.nutrition];
    newNutrition[index] = { ...newNutrition[index], ...updates };
    updateConfig({ nutrition: newNutrition });
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const newId = crypto.randomUUID();
    const newTemplate: SavedTemplate = {
      id: newId,
      name: newTemplateName,
      date: new Date().toLocaleDateString('pt-BR'),
      config: JSON.parse(JSON.stringify(config))
    };

    setIsSyncing(true);
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('templates')
          .insert([{
            id: newId,
            name: newTemplateName,
            config: config
          }]);
        
        if (error) throw error;
        
        // Só adiciona na lista se o banco confirmou o salvamento
        setSavedTemplates([newTemplate, ...savedTemplates]);
        setNewTemplateName('');
      } catch (err: any) {
        console.error("Erro ao salvar", err);
        setDbError(err.message || 'Erro ao salvar na nuvem');
      }
    } else {
       setSavedTemplates([newTemplate, ...savedTemplates]);
       setNewTemplateName('');
    }

    setIsSyncing(false);
  };

  const loadTemplate = (template: SavedTemplate) => {
    if (confirm(`Deseja carregar o modelo "${template.name}"?`)) {
      setConfig(template.config);
    }
  };

  const deleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Excluir este modelo permanentemente?")) return;

    setIsSyncing(true);
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setSavedTemplates(savedTemplates.filter(t => t.id !== id));
      } catch (err) {
        console.error("Erro ao deletar", err);
      }
    } else {
      setSavedTemplates(savedTemplates.filter(t => t.id !== id));
    }
    setIsSyncing(false);
  };

  const handlePrint = () => {
    const criticalErrors = validations.filter(v => v.type === 'error');
    if (criticalErrors.length > 0) return alert("Erro: Layout incompleto");
    window.print();
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `etiqueta-${config.productName.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (err) {
        alert("Erro no arquivo");
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateConfig({ logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const validations = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (config.width < 20) errors.push({ field: 'width', tab: 'dims', message: 'Largura mínima: 20mm', type: 'error' });
    if (!config.productName.trim()) errors.push({ field: 'productName', tab: 'product', message: 'Nome obrigatório', type: 'error' });
    return errors;
  }, [config]);

  const hasErrorOnTab = (tab: string) => validations.some(v => v.tab === tab && v.type === 'error');

  const handleImproveContent = async (field: keyof LabelConfig, topic: string) => {
    setIsLoading(true);
    try {
      const improved = await improveLabelContent(topic, String(config[field]));
      updateConfig({ [field]: improved });
    } finally { setIsLoading(false); }
  };

  const handleAIGenerateNutrition = async () => {
    setIsLoading(true);
    try {
      const data = await generateNutritionTable(config.productName);
      if (data) updateConfig({ nutrition: data });
    } finally { setIsLoading(false); }
  };

  const tabs = [
    { id: 'dims', icon: Layout, label: 'Layout' },
    { id: 'product', icon: Info, label: 'Produto' },
    { id: 'nutrition', icon: TableIcon, label: 'Nutrição' },
    { id: 'company', icon: Building2, label: 'Empresa' },
    { id: 'codes', icon: BarcodeIcon, label: 'Códigos' },
    { id: 'templates', icon: Library, label: 'Modelos' }
  ] as const;

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP);
    alert('SQL copiado! Cole no SQL Editor do Supabase.');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar - overflow-visible para o menu da conta não ser cortado */}
      <aside className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 overflow-visible shadow-lg z-20 print:hidden">
        <header className="p-6 border-b border-slate-100 flex flex-col gap-4 relative z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
                <Printer size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">LabelMaster Pro</h1>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${isCloudEnabled ? (dbError ? 'bg-amber-500' : 'bg-green-500') : 'bg-slate-300'}`}></div>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                     {isCloudEnabled ? (dbError ? 'Erro de Tabela' : 'Nuvem Conectada') : 'Modo Offline'}
                   </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              {githubUser ? (
                <>
                  <button 
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center gap-2 p-1 pl-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <span className="text-[10px] font-bold text-slate-600 hidden sm:block">@{githubUser.login}</span>
                    <img src={githubUser.avatar_url} alt="GitHub" className="w-7 h-7 rounded-full border border-white shadow-sm" />
                  </button>
                  
                  {showAccountMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Github size={10} /> Conta GitHub</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{githubUser.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">Sincronização Ativa</p>
                      </div>
                      <div className="p-1">
                        <button 
                          onClick={handleGitHubLogin} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold"
                        >
                          <ArrowRightLeft size={14} /> Trocar Conta
                        </button>
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                        >
                          <LogOut size={14} /> Sair do Perfil
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button 
                  onClick={handleGitHubLogin}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg transition-all text-[10px] font-bold shadow-md active:scale-95"
                >
                  <Github size={14} /> CONECTAR
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border ${validations.some(v => v.type === 'error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
              {validations.some(v => v.type === 'error') ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              <span className="flex-1">{validations.some(v => v.type === 'error') ? 'Layout Incompleto' : 'Pronto para Impressão'}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => jsonInputRef.current?.click()} className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded-lg transition-all" title="Importar JSON"><Upload size={18} /></button>
              <input type="file" ref={jsonInputRef} onChange={handleImportConfig} className="hidden" accept=".json" />
              <button onClick={handleDownloadConfig} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all" title="Exportar JSON"><FileJson size={18} /></button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-xs font-bold ml-1 shadow-md">
                <Printer size={14} /> IMPRIMIR
              </button>
            </div>
          </div>
        </header>

        <nav className="grid grid-cols-6 bg-slate-50 p-1 mx-4 my-2 rounded-xl border border-slate-200 shrink-0 relative z-40">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative flex flex-col items-center py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}>
              <tab.icon size={16} />
              <span className="text-[9px] mt-1">{tab.label}</span>
              {hasErrorOnTab(tab.id) && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>}
            </button>
          ))}
        </nav>

        {/* Scroll apenas nesta área de ferramentas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
          {activeTab === 'templates' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              {dbError && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-900">Script de Banco Pendente</h3>
                      <p className="text-[11px] text-amber-700 leading-tight mt-1">
                        A tabela no Supabase não foi encontrada. Execute o script abaixo no SQL Editor do seu projeto.
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 mb-3 relative group">
                    <pre className="text-[9px] text-slate-300 font-mono overflow-hidden whitespace-pre-wrap leading-tight">
                      {SQL_SETUP}
                    </pre>
                    <button onClick={copySql} className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors">
                      <Copy size={12} />
                    </button>
                  </div>
                  <button onClick={fetchTemplates} className="w-full flex items-center justify-center gap-2 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">
                    <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? 'Verificando...' : 'Testar Conexão Novamente'}
                  </button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-inner">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-3 uppercase tracking-wider">
                  {githubUser ? (
                    <img src={githubUser.avatar_url} className="w-5 h-5 rounded-full" />
                  ) : (
                    <Cloud size={16} />
                  )}
                  Salvar na Nuvem
                </h3>
                <form onSubmit={handleSaveTemplate} className="space-y-3">
                  <input type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Nome do Modelo (ex: Cookie Choco)" className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  <button type="submit" disabled={!newTemplateName.trim() || isSyncing || !!dbError} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 active:scale-95 shadow-md">
                    {isSyncing ? 'Enviando...' : (dbError ? 'Banco Indisponível' : 'Salvar Modelo')}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Library size={14} /> Seus Modelos</h3>
                  {isSyncing && <RefreshCw size={12} className="text-blue-500 animate-spin" />}
                </div>
                
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <CloudOff size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Nenhum modelo na biblioteca.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedTemplates.map(template => (
                      <div key={template.id} onClick={() => loadTemplate(template)} className="group bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 pr-8">{template.name}</h4>
                          <button onClick={(e) => deleteTemplate(template.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <div className="flex gap-2">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold uppercase text-[8px] tracking-tighter text-slate-600">{template.config.layoutStyle.split(' ')[0]}</span>
                            <span className="font-mono">{template.config.width}x{template.config.height}mm</span>
                          </div>
                          <div className="flex items-center gap-1 italic">
                            <Clock size={10} /> {template.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dims' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider"><Palette size={16} /> Identidade Visual</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.values(LabelStyle).map(style => (
                  <button key={style} onClick={() => updateConfig({ layoutStyle: style })} className={`px-3 py-2 text-[10px] font-bold rounded-lg border-2 transition-all ${config.layoutStyle === style ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'}`}>
                    {style}
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider"><Type size={16} /> Ajuste de Fontes</h3>
                {[
                  { label: 'Título do Produto', key: 'productNameFontSize' as const, min: 10, max: 48 },
                  { label: 'Textos de Apoio', key: 'globalFontSize' as const, min: 4, max: 18 },
                  { label: 'Dados da Empresa', key: 'companyFontSize' as const, min: 6, max: 20 }
                ].map(f => (
                  <div key={f.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-tight">{f.label}</label>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{(config[f.key] as number)}px</span>
                    </div>
                    <input type="range" min={f.min} max={f.max} step="1" value={(config[f.key] as number)} onChange={e => updateConfig({ [f.key]: Number(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider mt-6 pt-4 border-t border-slate-100"><Maximize2 size={16} /> Dimensões da Etiqueta</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Largura (mm)</label>
                  <input type="number" value={config.width} onChange={e => updateConfig({ width: Number(e.target.value) })} className="w-full bg-white border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Altura (mm)</label>
                  <input type="number" value={config.height} onChange={e => updateConfig({ height: Number(e.target.value) })} className="w-full bg-white border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'product' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider"><FontIcon size={16} /> Dados do Produto</h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome de Venda</label>
                <input type="text" value={config.productName} onChange={e => updateConfig({ productName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Bolo de Cenoura com Chocolate" />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600">Composição Completa</label>
                  <button disabled={isLoading} onClick={() => handleImproveContent('ingredients', 'lista de ingredientes técnica')} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 transition-all active:scale-95">
                    <Sparkles size={10} /> IA Profissional
                  </button>
                </div>
                <textarea rows={3} value={config.ingredients} onChange={e => updateConfig({ ingredients: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Liste os componentes..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lote</label>
                    <input type="text" value={config.batch} onChange={e => updateConfig({ batch: e.target.value })} className="w-full border rounded-lg px-3 py-1.5 text-sm" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Validade</label>
                    <input type="text" value={config.expiry} onChange={e => updateConfig({ expiry: e.target.value })} className="w-full border rounded-lg px-3 py-1.5 text-sm" />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider"><TableIcon size={16} /> Tabela Nutricional</h3>
                <button disabled={isLoading} onClick={handleAIGenerateNutrition} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm active:scale-95 transition-all">
                  {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {isLoading ? 'Calculando...' : 'IA Gerar Tabela'}
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {config.nutrition.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end group bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <input type="text" value={item.name} onChange={e => updateNutritionItem(idx, { name: e.target.value })} className="w-full bg-transparent border-b border-slate-200 text-xs py-0.5 outline-none focus:border-blue-400" />
                    </div>
                    <div className="w-20">
                      <input type="text" value={item.amount} onChange={e => updateNutritionItem(idx, { amount: e.target.value })} className="w-full bg-transparent border-b border-slate-200 text-xs py-0.5 outline-none text-right focus:border-blue-400" />
                    </div>
                    <button onClick={() => removeNutritionItem(idx)} className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <button onClick={addNutritionItem} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all text-xs font-bold active:scale-95"><Plus size={16} /> Adicionar Nutriente</button>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider"><Building2 size={16} /> Branding da Empresa</h3>
              <div className="flex items-center gap-6 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                <div className="relative group">
                   {config.logoUrl ? (
                     <img src={config.logoUrl} className="w-20 h-20 object-contain border p-2 rounded-xl bg-white shadow-md transition-transform group-hover:scale-105" />
                   ) : (
                     <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>
                   )}
                </div>
                <label className="flex-1 cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-xl text-slate-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all shadow-sm">
                    <Download size={18} className="text-blue-500" /> Upload de Logo
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="space-y-3">
                <input type="text" value={config.companyName} onChange={e => updateConfig({ companyName: e.target.value })} placeholder="Razão Social" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <input type="text" value={config.companyContact} onChange={e => updateConfig({ companyContact: e.target.value })} placeholder="Endereço / Telefone" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={config.whatsapp} onChange={e => updateConfig({ whatsapp: e.target.value })} placeholder="WhatsApp" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <input type="text" value={config.email} onChange={e => updateConfig({ email: e.target.value })} placeholder="Email" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'codes' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider"><BarcodeIcon size={16} /> Identificadores</h3>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Código de Barras</label>
                  {config.barcode.trim() && (
                    <div className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      <BarcodeIcon size={10} /> {getBarcodeStandard(config.barcode)}
                    </div>
                  )}
                </div>
                <input type="text" value={config.barcode} onChange={e => updateConfig({ barcode: e.target.value })} placeholder="Ex: 789..." className="w-full border rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all border-slate-200 shadow-inner" />
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital QR Link</label>
                  {config.qrCode.trim() && (
                    <div className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${isValidUrl(config.qrCode) ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                      {isValidUrl(config.qrCode) ? <Globe size={10} /> : <QrCode size={10} />}
                      {isValidUrl(config.qrCode) ? 'Link Válido' : 'Somente Texto'}
                    </div>
                  )}
                </div>
                <input type="text" value={config.qrCode} onChange={e => updateConfig({ qrCode: e.target.value })} placeholder="URL do Site / Instagram" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all border-slate-200 shadow-inner mb-4" />
                <div className="flex items-center gap-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Tamanho QR</label>
                  <input type="range" min="20" max="250" step="1" value={config.qrCodeSize} onChange={e => updateConfig({ qrCodeSize: Number(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 relative z-40">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">LabelMaster Pro</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : (dbError ? 'bg-red-500' : 'bg-green-500')}`}></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              {isCloudEnabled ? (dbError ? 'Erro DB' : (isSyncing ? 'Sincronizando' : 'Cloud OK')) : 'Offline'}
            </span>
          </div>
        </footer>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-100 flex flex-col items-center justify-center p-8 print:p-0 print:bg-white relative">
        <div className="absolute top-8 left-8 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/50 print:hidden">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Visualização Real-Time</span>
        </div>
        
        <div className="transform scale-[0.8] sm:scale-[0.85] md:scale-100 transition-all origin-top lg:origin-center drop-shadow-2xl">
          <LabelPreview config={config} id="printable-area" />
        </div>

        <div className="mt-12 bg-white/40 backdrop-blur-xl px-8 py-5 rounded-3xl border border-white/40 shadow-xl print:hidden max-w-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-tight flex items-center justify-center gap-2"><Printer size={16} /> Configurações de Impressão</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Impressora: <span className="text-blue-600 font-bold">{config.width}x{config.height}mm</span>. 
            Papel Contínuo ou GAP. Desative as margens no diálogo do navegador antes de imprimir.
          </p>
        </div>
      </main>
      
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-xs text-center border border-white/20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Aguarde</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Processando Inteligência Artificial...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
