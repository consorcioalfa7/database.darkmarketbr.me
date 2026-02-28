'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Edit2, Trash2, ShieldCheck,
  Database, DownloadCloud, X, Filter, Activity, History,
  TerminalSquare, CreditCard, Copy, CheckCircle2, Save,
  Sparkles, Send, Bot, Loader2, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Types
interface Site {
  id: string;
  url: string;
  category: string;
  platform: string;
  gateway: string;
  bins: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface KnownBin {
  id: string;
  name: string;
  bins: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Initial data for fallback
const initialRawData = `www.emitecinformatica.com.br - INFORMÁTICA E COMPUTADORES - NUVEM SHOP - PagBank
www.brutosfone.com.br - CELULARES E ACESSÓRIOS - NUVEM SHOP - PagBank
www.ctelmovelltda.com.br - CELULARES E TELEFONIA - NUVEM SHOP - PagBank
www.tuacase.com.br - ACESSÓRIOS PARA CELULAR - NUVEM SHOP - PagBank
www.eletronicatranstel.com.br - ELETRÔNICOS E COMPONENTES - NUVEM SHOP - PagBank
www.eagletechoficial.com.br - ELETRÔNICOS E TECNOLOGIA - NUVEM SHOP - PagBank
www.ankershop.com.br - CAIXAS DE SOM, FONES E ELETRÔNICOS - NUVEM SHOP - PagBank
www.e-placas.tv.br - ELETRÔNICOS E PLACAS DE TV - NUVEM SHOP - PagBank
www.aleinkimpressoras.com.br - IMPRESSORAS E INFORMÁTICA - NUVEM SHOP - PagBank
www.magnatadosjogos.com.br - GAMES E CONSOLES - NUVEM SHOP - PagBank
www.rickygames.com.br - GAMES E CONSOLES - NUVEM SHOP - PagBank
www.bitkeys.com.br - SOFTWARE E TECNOLOGIA - NUVEM SHOP - PagBank
www.kirapettech.com.br - TECNOLOGIA PARA PETS - NUVEM SHOP - PagBank
www.mfinfostore.com.br - INFORMÁTICA E ELETRÔNICOS - NUVEM SHOP - PagarMe
www.infocellshop.com.br - CELULARES E ELETRÔNICOS - NUVEM SHOP - PagarMe
www.maxracer.com.br - ACESSÓRIOS E CADEIRAS GAMER - NUVEM SHOP - PagarMe
www.lojapolicompcomponentes.com.br - COMPONENTES ELETRÔNICOS - NUVEM SHOP - PagarMe
www.inovaoficial.com.br - ACESSÓRIOS E ELETRÔNICOS - NUVEM SHOP - PagarMe
www.ledeletro.com.br - ELETRÔNICOS E ELETRO - NUVEM SHOP - PagarMe
www.royalcases.com.br - ACESSÓRIOS PARA CELULAR - NUVEM SHOP - PagarMe`;

const parseRawData = (dataStr: string): Omit<Site, 'createdAt' | 'updatedAt'>[] => {
  return dataStr.split('\n').filter(line => line.trim() !== '').map((line, index) => {
    const parts = line.split(' - ').map(p => p.replace(/"/g, '').trim());
    return {
      id: crypto.randomUUID(),
      url: parts[0] || '',
      category: parts[1] || 'Outros',
      platform: parts[2] || 'Desconhecida',
      gateway: parts[3] || 'Desconhecido',
      bins: '',
      status: index % 5 === 0 ? 'Ativo (Inf. Externa)' : 'Ativo (Verificado)'
    };
  });
};

const defaultKnownBins: Omit<KnownBin, 'createdAt' | 'updatedAt'>[] = [
  { id: '1', name: "Amazon", bins: "553636, 498408, 552640, 550209, 516292" },
  { id: '2', name: "Picpay", bins: "546479, 548262, 407843, 650597" },
  { id: '3', name: "Mercado Livre", bins: "651652, 230650, 536119, 550209, 492061, 499818, 406669" },
  { id: '4', name: "Shopee", bins: "520048, 514945, 550209, 516292" },
  { id: '5', name: "Link Mercado Pago", bins: "534696, 516292, 553636, 498408, 531249, 553665, 407843, 406168" }
];

export default function DarkToolsLabsDB() {
  const [sites, setSites] = useState<Site[]>([]);
  const [knownBins, setKnownBins] = useState<KnownBin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBinDictModalOpen, setIsBinDictModalOpen] = useState(false);
  const [isBulkBinModalOpen, setIsBulkBinModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [bulkText, setBulkText] = useState('');

  // BIN Dictionary
  const [binSearchTerm, setBinSearchTerm] = useState('');
  const [copiedBin, setCopiedBin] = useState<string | null>(null);
  const [isAddingBin, setIsAddingBin] = useState(false);
  const [newBinName, setNewBinName] = useState('');
  const [newBinValues, setNewBinValues] = useState('');

  // Bulk BIN Import
  const [bulkBinText, setBulkBinText] = useState('');

  // AI Assistant
  const [aiMode, setAiMode] = useState<'analyze' | 'chat'>('chat');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    sites: Array<{ url: string; category: string; platform: string; gateway: string }>;
    bins: Array<{ name: string; bins: string }>;
    summary: string;
    suggestions: string;
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Ativos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [gatewayFilter, setGatewayFilter] = useState('Todos');

  // Form state
  const [formData, setFormData] = useState({
    url: '',
    category: '',
    platform: '',
    gateway: '',
    bins: '',
    status: 'Ativo (Verificado)'
  });

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sitesRes, binsRes] = await Promise.all([
        fetch('/api/sites'),
        fetch('/api/bins')
      ]);

      if (sitesRes.ok && binsRes.ok) {
        const sitesData = await sitesRes.json();
        const binsData = await binsRes.json();
        setSites(sitesData);
        setKnownBins(binsData);
        setIsDbConnected(true);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('Error fetching data, using local fallback:', error);
      setIsDbConnected(false);
      const parsedSites = parseRawData(initialRawData);
      setSites(parsedSites as Site[]);
      setKnownBins(defaultKnownBins as KnownBin[]);
    } finally {
      setIsLoading(false);
    }
  };

  // Categories and Gateways for filters
  const categories = useMemo(() => ['Todas', ...new Set(sites.map(s => s.category))], [sites]);
  const gateways = useMemo(() => ['Todos', ...new Set(sites.map(s => s.gateway))], [sites]);

  // Filtered sites
  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      if (statusFilter === 'Ativos' && site.status === 'Desativado') return false;
      if (statusFilter === 'Desativados' && site.status !== 'Desativado') return false;
      if (categoryFilter !== 'Todas' && site.category !== categoryFilter) return false;
      if (gatewayFilter !== 'Todos' && site.gateway !== gatewayFilter) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (site.url && site.url.toLowerCase().includes(term)) ||
          (site.category && site.category.toLowerCase().includes(term)) ||
          (site.gateway && site.gateway.toLowerCase().includes(term)) ||
          (site.bins && site.bins.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [sites, searchTerm, statusFilter, categoryFilter, gatewayFilter]);

  // CRUD Operations for Sites
  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();

    const siteData = {
      url: formData.url,
      category: formData.category,
      platform: formData.platform,
      gateway: formData.gateway,
      bins: formData.bins,
      status: formData.status
    };

    if (!isDbConnected) {
      if (currentSite) {
        setSites(sites.map(s => s.id === currentSite.id ? { ...siteData, id: currentSite.id, createdAt: s.createdAt, updatedAt: new Date().toISOString() } : s));
      } else {
        const newSite = { ...siteData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setSites([newSite as Site, ...sites]);
      }
      setIsModalOpen(false);
      resetForm();
      toast.success('Site salvo localmente');
      return;
    }

    try {
      if (currentSite) {
        const res = await fetch(`/api/sites/${currentSite.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData)
        });
        if (!res.ok) throw new Error('Failed to update');
        toast.success('Site atualizado com sucesso');
      } else {
        const res = await fetch('/api/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData)
        });
        if (!res.ok) throw new Error('Failed to create');
        toast.success('Site criado com sucesso');
      }
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving site:', error);
      toast.error('Erro ao salvar site');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este site?')) return;

    if (!isDbConnected) {
      setSites(sites.filter(s => s.id !== id));
      toast.success('Site removido localmente');
      return;
    }

    try {
      const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setSites(sites.filter(s => s.id !== id));
      toast.success('Site removido com sucesso');
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Erro ao remover site');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      toast.error('Digite os sites para importar');
      return;
    }

    const newSites = bulkText.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split(' - ').map(p => p.replace(/"/g, '').trim());
      return {
        url: parts[0] || '',
        category: parts[1] || 'Outros',
        platform: parts[2] || 'Desconhecida',
        gateway: parts[3] || 'Desconhecido',
        bins: '',
        status: 'Ativo (Verificado)'
      };
    });

    if (!isDbConnected) {
      const newSitesWithIds = newSites.map(site => ({
        ...site,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      setSites([...newSitesWithIds as Site[], ...sites]);
      setBulkText('');
      setIsBulkModalOpen(false);
      toast.success(`${newSites.length} sites importados localmente`);
      return;
    }

    try {
      const res = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sites: newSites })
      });
      if (!res.ok) throw new Error('Failed to import');
      const data = await res.json();
      await fetchData();
      setBulkText('');
      setIsBulkModalOpen(false);
      toast.success(`${data.count} sites importados com sucesso`);
    } catch (error) {
      console.error('Error bulk importing:', error);
      toast.error('Erro ao importar sites');
    }
  };

  // CRUD Operations for BIN Dictionary
  const handleSaveBinDict = async () => {
    if (!newBinName.trim() || !newBinValues.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    const cleanBins = newBinValues.split(',').map(b => b.trim()).filter(b => b).join(', ');

    if (!isDbConnected) {
      const newBinObj = { id: crypto.randomUUID(), name: newBinName, bins: cleanBins, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setKnownBins([...knownBins, newBinObj as KnownBin]);
      setNewBinName('');
      setNewBinValues('');
      setIsAddingBin(false);
      toast.success('BIN adicionado localmente');
      return;
    }

    try {
      const res = await fetch('/api/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBinName, bins: cleanBins })
      });
      if (!res.ok) throw new Error('Failed to create');
      await fetchData();
      setNewBinName('');
      setNewBinValues('');
      setIsAddingBin(false);
      toast.success('BIN adicionado com sucesso');
    } catch (error) {
      console.error('Error saving bin:', error);
      toast.error('Erro ao salvar BIN');
    }
  };

  const handleDeleteBinDict = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta referência?')) return;

    if (!isDbConnected) {
      setKnownBins(knownBins.filter(b => b.id !== id));
      toast.success('Referência removida localmente');
      return;
    }

    try {
      const res = await fetch(`/api/bins/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setKnownBins(knownBins.filter(b => b.id !== id));
      toast.success('Referência removida com sucesso');
    } catch (error) {
      console.error('Error deleting bin:', error);
      toast.error('Erro ao remover referência');
    }
  };

  // Bulk BIN Import
  const handleBulkBinImport = async () => {
    if (!bulkBinText.trim()) {
      toast.error('Digite os BINs para importar');
      return;
    }

    // Parse BINs - format: NOME - bins separados por vírgula
    const newBins = bulkBinText.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split(' - ').map(p => p.trim());
      if (parts.length >= 2) {
        return {
          name: parts[0],
          bins: parts.slice(1).join(', ')
        };
      }
      return null;
    }).filter((b): b is { name: string; bins: string } => b !== null);

    if (newBins.length === 0) {
      toast.error('Nenhum BIN válido encontrado. Use o formato: NOME - bins');
      return;
    }

    if (!isDbConnected) {
      const newBinsWithIds = newBins.map(bin => ({
        id: crypto.randomUUID(),
        ...bin,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      setKnownBins([...newBinsWithIds as KnownBin[], ...knownBins]);
      setBulkBinText('');
      setIsBulkBinModalOpen(false);
      toast.success(`${newBins.length} BINs importados localmente`);
      return;
    }

    try {
      const res = await fetch('/api/bins-bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bins: newBins })
      });
      if (!res.ok) throw new Error('Failed to import');
      const data = await res.json();
      await fetchData();
      setBulkBinText('');
      setIsBulkBinModalOpen(false);
      toast.success(`${data.count} BINs importados com sucesso`);
    } catch (error) {
      console.error('Error bulk importing BINs:', error);
      toast.error('Erro ao importar BINs');
    }
  };

  // AI Functions
  const handleAIAnalyze = async () => {
    if (!aiInput.trim()) {
      toast.error('Digite os dados para analisar');
      return;
    }

    setAiIsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', data: aiInput })
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();

      setAiAnalysisResult(data.result);

      if (data.result.sites?.length > 0 || data.result.bins?.length > 0) {
        toast.success(`Análise concluída: ${data.result.sites?.length || 0} sites e ${data.result.bins?.length || 0} BINs identificados`);
      } else {
        toast.info('Análise concluída - verifique o resumo');
      }
    } catch (error) {
      console.error('AI analyze error:', error);
      toast.error('Erro na análise de IA');
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleAIChat = async () => {
    if (!aiInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: [...aiMessages, userMessage]
        })
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();

      setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('Erro no chat com IA');
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleImportAIResults = async () => {
    if (!aiAnalysisResult) return;

    // Import sites
    if (aiAnalysisResult.sites && aiAnalysisResult.sites.length > 0) {
      try {
        if (isDbConnected) {
          await fetch('/api/bulk-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sites: aiAnalysisResult.sites })
          });
        } else {
          const newSites = aiAnalysisResult.sites.map(site => ({
            id: crypto.randomUUID(),
            ...site,
            bins: '',
            status: 'Ativo (Verificado)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setSites(prev => [...newSites as Site[], ...prev]);
        }
      } catch (error) {
        console.error('Error importing AI sites:', error);
      }
    }

    // Import BINs
    if (aiAnalysisResult.bins && aiAnalysisResult.bins.length > 0) {
      try {
        if (isDbConnected) {
          await fetch('/api/bins-bulk-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bins: aiAnalysisResult.bins })
          });
        } else {
          const newBins = aiAnalysisResult.bins.map(bin => ({
            id: crypto.randomUUID(),
            ...bin,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setKnownBins(prev => [...newBins as KnownBin[], ...prev]);
        }
      } catch (error) {
        console.error('Error importing AI BINs:', error);
      }
    }

    await fetchData();
    setAiAnalysisResult(null);
    setAiInput('');
    toast.success('Dados importados com sucesso!');
  };

  // UI Functions
  const openEditModal = (site: Site) => {
    setCurrentSite(site);
    setFormData({
      url: site.url,
      category: site.category,
      platform: site.platform,
      gateway: site.gateway,
      bins: site.bins,
      status: site.status
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setCurrentSite(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      url: '',
      category: '',
      platform: '',
      gateway: '',
      bins: '',
      status: 'Ativo (Verificado)'
    });
  };

  const handleCopyBin = (bin: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(bin);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = bin;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedBin(bin);
      setTimeout(() => setCopiedBin(null), 2000);
      toast.success('BIN copiado!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status.includes('Verificado')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    if (status.includes('Externa')) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  const filteredBinDict = knownBins.filter(item =>
    item.name.toLowerCase().includes(binSearchTerm.toLowerCase()) ||
    item.bins.includes(binSearchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-emerald-500/30">
      {/* Database Connection Warning */}
      {!isDbConnected && (
        <div className="bg-amber-900/40 border-b border-amber-500/50 p-3 flex items-center justify-center gap-2 text-amber-200 text-sm">
          <Database className="w-4 h-4" />
          <span><b>Modo de Demonstração:</b> Dados armazenados localmente. Configure o banco de dados para persistência completa.</span>
        </div>
      )}

      {/* Topbar */}
      <header className="bg-[#111111]/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-20 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl glow-emerald animate-pulse-glow">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 gradient-text">
                DarkToolsLabs DataBase
              </h1>
              <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-0.5 text-glow-emerald">
                Powered by @DarkMarket_Oficial
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setIsAIModalOpen(true);
                setAiMode('chat');
                setAiMessages([]);
                setAiAnalysisResult(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg border border-purple-500/50 transition-all duration-300 text-white btn-glow glow-purple hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" /> Assistente IA
            </button>
            <a href="https://t.me/DarkMarket_Oficial" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 transition-colors">
              <TerminalSquare className="w-3.5 h-3.5 text-blue-400" /> DarkMarket
            </a>
            <a href="https://t.me/DarkToolsLabs" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 transition-colors">
              <TerminalSquare className="w-3.5 h-3.5 text-blue-400" /> DarkToolsLabs
            </a>
            <a href="https://discord.gg/YcY3eFfe" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 transition-colors">
              Discord
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] p-4 md:p-5 rounded-xl border border-gray-800/50 flex items-center justify-between card-hover shimmer animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div>
              <p className="text-xs md:text-sm text-gray-500 mb-1">Total de Sites</p>
              <p className="text-xl md:text-2xl font-bold text-white">{sites.length}</p>
            </div>
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <Database className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111111] to-emerald-950/20 p-4 md:p-5 rounded-xl border border-emerald-900/30 flex items-center justify-between card-hover animate-fade-in glow-emerald" style={{ animationDelay: '100ms' }}>
            <div>
              <p className="text-xs md:text-sm text-emerald-500/70 mb-1">Ativos (Verificados)</p>
              <p className="text-xl md:text-2xl font-bold text-emerald-400 text-glow-emerald">
                {sites.filter(s => s.status === 'Ativo (Verificado)').length}
              </p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111111] to-blue-950/20 p-4 md:p-5 rounded-xl border border-blue-900/30 flex items-center justify-between card-hover animate-fade-in glow-blue" style={{ animationDelay: '200ms' }}>
            <div>
              <p className="text-xs md:text-sm text-blue-500/70 mb-1">Ativos (Inf. Externa)</p>
              <p className="text-xl md:text-2xl font-bold text-blue-400">
                {sites.filter(s => s.status === 'Ativo (Inf. Externa)').length}
              </p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111111] to-red-950/20 p-4 md:p-5 rounded-xl border border-red-900/30 flex items-center justify-between card-hover animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div>
              <p className="text-xs md:text-sm text-red-500/70 mb-1">Desativados</p>
              <p className="text-xl md:text-2xl font-bold text-red-400">
                {sites.filter(s => s.status === 'Desativado').length}
              </p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <History className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#111111]/80 backdrop-blur-sm p-4 rounded-xl border border-gray-800/50 mb-6 flex flex-col lg:flex-row gap-4 justify-between glass">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar site, gateway, bin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-4 py-2 w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativos">Visualizar: Apenas Ativos</SelectItem>
                <SelectItem value="Desativados">Visualizar: Histórico (Desativados)</SelectItem>
                <SelectItem value="Todos">Visualizar: Todos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-4 py-2 w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c === 'Todas' ? 'Categoria: Todas' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
              <SelectTrigger className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-4 py-2 w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gateways.map(g => (
                  <SelectItem key={g} value={g}>{g === 'Todos' ? 'Gateway: Todos' : g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setIsBinDictModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/30 transition-colors"
            >
              <CreditCard className="w-4 h-4" /> Bins Globais
            </Button>
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" /> Importar Sites
            </Button>
            <Button
              onClick={openNewModal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(5,150,105,0.3)]"
            >
              <Plus className="w-4 h-4" /> Novo Site
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0a0a] border-b border-gray-800 text-gray-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Site</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Gateway</th>
                <th className="px-6 py-4 font-medium">Plataforma</th>
                <th className="px-6 py-4 font-medium">BIN(s) Alvo</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-emerald-500 font-medium">
                    A carregar dados da Base de Dados...
                  </td>
                </tr>
              ) : filteredSites.length > 0 ? filteredSites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-400">
                    <a href={`https://${site.url.replace('https://', '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                      {site.url}
                    </a>
                  </td>
                  <td className="px-6 py-4">{site.category}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700 text-gray-300">
                      {site.gateway}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{site.platform}</td>
                  <td className="px-6 py-4 text-emerald-500 font-mono text-xs">
                    {site.bins || <span className="text-gray-600 italic">-- vazio --</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs border font-medium whitespace-nowrap ${getStatusStyle(site.status)}`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(site)} className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(site.id)} className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-red-900/30 rounded transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum site encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal: Adicionar / Editar Site */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a]">
            <DialogTitle className="text-lg font-bold text-white">
              {currentSite ? 'Editar Site' : 'Adicionar Novo Site'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSite} className="p-6 space-y-4">
            <div>
              <Label className="block text-xs text-gray-400 mb-1">URL do Site</Label>
              <Input
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                placeholder="www.exemplo.com.br"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Categoria/Tipologia</Label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                  placeholder="Ex: INFORMÁTICA"
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Plataforma</Label>
                <Input
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                  placeholder="Ex: NUVEM SHOP"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Gateway de Pagamento</Label>
                <Input
                  required
                  value={formData.gateway}
                  onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                  placeholder="Ex: PagBank"
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo (Verificado)">Ativo (Verificado)</SelectItem>
                    <SelectItem value="Ativo (Inf. Externa)">Ativo (Inf. Externa)</SelectItem>
                    <SelectItem value="Desativado">Desativado (Histórico)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-xs text-gray-400 mb-1">BIN(s) a Utilizar (Opcional)</Label>
              <Input
                value={formData.bins}
                onChange={(e) => setFormData({ ...formData, bins: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono text-emerald-400"
                placeholder="Ex: 531234, 451234"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
              >
                Gravar Dados
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Importação em Massa de Sites */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a] flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <TerminalSquare className="w-5 h-5 text-emerald-500" />
              Importação em Massa de Sites
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-hidden flex flex-col">
            {/* Instructions */}
            <div className="mb-4 flex-shrink-0">
              <p className="text-sm text-gray-400 mb-2">
                Cole a lista de sites no formato:
              </p>
              <code className="block text-xs text-emerald-400 bg-gray-900 px-3 py-2 rounded-lg">
                www.site.com - CATEGORIA - PLATAFORMA - GATEWAY
              </code>
            </div>

            {/* Textarea with counter */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  Uma linha por site
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  bulkText.split('\n').filter(l => l.trim()).length > 0 
                    ? 'text-emerald-400 bg-emerald-500/10' 
                    : 'text-gray-500'
                }`}>
                  {bulkText.split('\n').filter(l => l.trim()).length} sites detectados
                </span>
              </div>
              
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="flex-1 min-h-[200px] bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg p-3 text-gray-300 font-mono focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="www.site.com.br - INFORMÁTICA - NUVEM SHOP - PagBank
www.outro-site.com - CELULARES - SHOPIFY - PagarMe
www.maisum.com - GAMES - NUVEM SHOP - PagBank"
              />
            </div>

            {/* Preview of first parsed sites */}
            {bulkText.trim() && (
              <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg border border-gray-800 max-h-32 overflow-y-auto flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2">Preview (primeiros 5):</p>
                <div className="space-y-1">
                  {bulkText.split('\n').filter(l => l.trim()).slice(0, 5).map((line, idx) => {
                    const parts = line.split(' - ').map(p => p.trim());
                    return (
                      <div key={idx} className="text-xs font-mono text-gray-400 flex gap-2">
                        <span className="text-emerald-500">{parts[0] || '---'}</span>
                        <span className="text-gray-600">|</span>
                        <span>{parts[1] || 'Outros'}</span>
                        <span className="text-gray-600">|</span>
                        <span>{parts[3] || 'Desconhecido'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="px-6 py-4 border-t border-gray-800 bg-[#0a0a0a] flex justify-between items-center flex-shrink-0">
            <span className="text-xs text-gray-500">
              {bulkText.split('\n').filter(l => l.trim()).length > 0 
                ? `✓ ${bulkText.split('\n').filter(l => l.trim()).length} sites prontos para importar`
                : 'Cole os dados acima'
              }
            </span>
            <div className="flex gap-3">
              <Button
                onClick={() => { setBulkText(''); setIsBulkModalOpen(false); }}
                variant="outline"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadCloud className="w-4 h-4 mr-2" />
                Importar {bulkText.split('\n').filter(l => l.trim()).length > 0 ? `(${bulkText.split('\n').filter(l => l.trim()).length})` : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Dicionário de BINs */}
      <Dialog open={isBinDictModalOpen} onOpenChange={setIsBinDictModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a]">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Dicionário Global de BINs
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 border-b border-gray-800 bg-[#0a0a0a] flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Pesquisar loja, gateway ou BIN..."
                value={binSearchTerm}
                onChange={(e) => setBinSearchTerm(e.target.value)}
                className="w-full bg-[#111111] border border-gray-700 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <Button
              onClick={() => setIsBulkBinModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" /> Importar BINs
            </Button>
            <Button
              onClick={() => setIsAddingBin(!isAddingBin)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {isAddingBin ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingBin ? 'Cancelar' : 'Novo Registo'}
            </Button>
          </div>

          {/* Add BIN Panel */}
          {isAddingBin && (
            <div className="p-4 border-b border-gray-800 bg-[#161616] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-emerald-400">Adicionar Nova Referência</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  type="text"
                  value={newBinName}
                  onChange={e => setNewBinName(e.target.value)}
                  placeholder="Nome (Ex: Netflix, Nubank...)"
                  className="bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <Input
                  type="text"
                  value={newBinValues}
                  onChange={e => setNewBinValues(e.target.value)}
                  placeholder="BINs separados por vírgula (Ex: 553636, 498408)"
                  className="md:col-span-2 bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveBinDict}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Guardar BIN Global
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-y-auto p-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBinDict.map((item) => {
                const binArray = item.bins ? item.bins.split(',').map(b => b.trim()) : [];
                return (
                  <div key={item.id} className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 group relative">
                    <button
                      onClick={() => handleDeleteBinDict(item.id)}
                      className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar referência"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <h3 className="text-emerald-400 font-bold mb-3 uppercase text-xs tracking-wider border-b border-gray-800 pb-2 pr-6">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {binArray.map((bin, idx) => (
                        <button
                          key={`${item.id}-${bin}-${idx}`}
                          onClick={() => handleCopyBin(bin)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 rounded text-xs font-mono transition-colors"
                          title="Copiar BIN"
                        >
                          {copiedBin === bin ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-50" />}
                          {bin}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              {filteredBinDict.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  Nenhuma referência encontrada.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Importação em Massa de BINs */}
      <Dialog open={isBulkBinModalOpen} onOpenChange={setIsBulkBinModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a] flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Importação em Massa de BINs
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-hidden flex flex-col">
            {/* Instructions */}
            <div className="mb-4 flex-shrink-0">
              <p className="text-sm text-gray-400 mb-2">
                Cole a lista de BINs no formato:
              </p>
              <code className="block text-xs text-emerald-400 bg-gray-900 px-3 py-2 rounded-lg">
                NOME - BIN1, BIN2, BIN3
              </code>
            </div>

            {/* Textarea with counter */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  Uma linha por referência
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  bulkBinText.split('\n').filter(l => l.trim()).length > 0 
                    ? 'text-emerald-400 bg-emerald-500/10' 
                    : 'text-gray-500'
                }`}>
                  {bulkBinText.split('\n').filter(l => l.trim()).length} referências detectadas
                </span>
              </div>
              
              <Textarea
                value={bulkBinText}
                onChange={(e) => setBulkBinText(e.target.value)}
                className="flex-1 min-h-[200px] bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg p-3 text-gray-300 font-mono focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="Netflix - 553636, 498408, 552640
Amazon - 546479, 548262, 407843
Nubank - 650597, 516292"
              />
            </div>

            {/* Preview of first parsed BINs */}
            {bulkBinText.trim() && (
              <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg border border-gray-800 max-h-32 overflow-y-auto flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2">Preview (primeiros 5):</p>
                <div className="space-y-1">
                  {bulkBinText.split('\n').filter(l => l.trim()).slice(0, 5).map((line, idx) => {
                    const parts = line.split(' - ').map(p => p.trim());
                    return (
                      <div key={idx} className="text-xs font-mono text-gray-400 flex gap-2">
                        <span className="text-emerald-500 font-medium">{parts[0] || '---'}</span>
                        <span className="text-gray-600">:</span>
                        <span className="text-gray-400">{parts.slice(1).join(', ') || 'sem BINs'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="px-6 py-4 border-t border-gray-800 bg-[#0a0a0a] flex justify-between items-center flex-shrink-0">
            <span className="text-xs text-gray-500">
              {bulkBinText.split('\n').filter(l => l.trim()).length > 0 
                ? `✓ ${bulkBinText.split('\n').filter(l => l.trim()).length} referências prontas para importar`
                : 'Cole os dados acima'
              }
            </span>
            <div className="flex gap-3">
              <Button
                onClick={() => { setBulkBinText(''); setIsBulkBinModalOpen(false); }}
                variant="outline"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBulkBinImport}
                disabled={!bulkBinText.trim()}
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <DownloadCloud className="w-4 h-4 mr-2" />
                Importar {bulkBinText.split('\n').filter(l => l.trim()).length > 0 ? `(${bulkBinText.split('\n').filter(l => l.trim()).length})` : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Assistente IA */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a]">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Assistente IA - DarkToolsLabs
            </DialogTitle>
          </DialogHeader>

          {/* Mode Tabs */}
          <div className="flex border-b border-gray-800 bg-[#0a0a0a]">
            <button
              onClick={() => { setAiMode('chat'); setAiAnalysisResult(null); }}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${aiMode === 'chat' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-[#111111]' : 'text-gray-400 hover:text-white'}`}
            >
              <Bot className="w-4 h-4" /> Chat com IA
            </button>
            <button
              onClick={() => { setAiMode('analyze'); setAiMessages([]); }}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${aiMode === 'analyze' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-[#111111]' : 'text-gray-400 hover:text-white'}`}
            >
              <Zap className="w-4 h-4" /> Analisar Dados
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-4">
            {aiMode === 'chat' ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
                  {aiMessages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Olá! Sou o assistente IA do DarkToolsLabs.</p>
                      <p className="text-xs mt-1">Posso ajudar com consultas sobre sites, BINs, estatísticas e mais.</p>
                    </div>
                  )}
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {aiIsLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg px-4 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAIChat()}
                    placeholder="Pergunte sobre sites, BINs, estatísticas..."
                    className="flex-1 bg-[#0a0a0a] border border-gray-700 text-white focus:border-emerald-500"
                    disabled={aiIsLoading}
                  />
                  <Button
                    onClick={handleAIChat}
                    disabled={aiIsLoading || !aiInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Analysis Mode */}
                <p className="text-sm text-gray-400 mb-3">
                  Cole dados brutos (texto sem tratamento) e a IA irá extrair sites e BINs automaticamente.
                </p>

                <Textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full h-48 bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg p-3 text-gray-300 focus:border-emerald-500 focus:outline-none resize-none mb-4"
                  placeholder="Cole aqui qualquer texto, lista, tabela ou dados não estruturados...&#10;&#10;A IA identificará automaticamente URLs, categorias, gateways e BINs."
                />

                <Button
                  onClick={handleAIAnalyze}
                  disabled={aiIsLoading || !aiInput.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-500 mb-4"
                >
                  {aiIsLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                  ) : (
                    <><Zap className="w-4 h-4 mr-2" /> Analisar Dados</>
                  )}
                </Button>

                {/* Analysis Results */}
                {aiAnalysisResult && (
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 overflow-y-auto max-h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-emerald-400">Resultado da Análise</h3>
                      {(aiAnalysisResult.sites?.length > 0 || aiAnalysisResult.bins?.length > 0) && (
                        <Button
                          onClick={handleImportAIResults}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500"
                        >
                          <DownloadCloud className="w-4 h-4 mr-1" /> Importar Tudo
                        </Button>
                      )}
                    </div>

                    {aiAnalysisResult.sites && aiAnalysisResult.sites.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Sites identificados ({aiAnalysisResult.sites.length}):</p>
                        <div className="bg-[#111111] rounded p-2 text-xs font-mono">
                          {aiAnalysisResult.sites.map((site, idx) => (
                            <div key={idx} className="text-gray-400">{site.url} | {site.category} | {site.gateway}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiAnalysisResult.bins && aiAnalysisResult.bins.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">BINs identificados ({aiAnalysisResult.bins.length}):</p>
                        <div className="bg-[#111111] rounded p-2 text-xs font-mono">
                          {aiAnalysisResult.bins.map((bin, idx) => (
                            <div key={idx} className="text-gray-400">{bin.name}: {bin.bins}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiAnalysisResult.summary && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Resumo:</p>
                        <p className="text-sm text-gray-300">{aiAnalysisResult.summary}</p>
                      </div>
                    )}

                    {aiAnalysisResult.suggestions && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sugestões:</p>
                        <p className="text-sm text-blue-400">{aiAnalysisResult.suggestions}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
