import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ALLOWED_USERS = (process.env.TELEGRAM_ALLOWED_USERS || '')
  .split(',')
  .map(id => id.trim())
  .filter(id => id);

// Helper to send message to Telegram
async function sendTelegramMessage(chatId: string, text: string, parseMode: string = 'HTML') {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

// Check if user is authorized
function isUserAuthorized(userId: string | number): boolean {
  // If no allowed users configured, allow everyone (not recommended for production)
  if (TELEGRAM_ALLOWED_USERS.length === 0) return true;
  return TELEGRAM_ALLOWED_USERS.includes(String(userId));
}

// Parse site data
function parseSiteLine(line: string): { url: string; category: string; platform: string; gateway: string } | null {
  const parts = line.split(' - ').map(p => p.replace(/"/g, '').trim());
  if (parts.length < 4) return null;
  return {
    url: parts[0] || '',
    category: parts[1] || 'Outros',
    platform: parts[2] || 'Desconhecida',
    gateway: parts[3] || 'Desconhecido',
  };
}

// Parse BIN data
function parseBinLine(line: string): { name: string; bins: string } | null {
  const parts = line.split(' - ').map(p => p.trim());
  if (parts.length < 2) return null;
  return {
    name: parts[0],
    bins: parts.slice(1).join(', '),
  };
}

// Handle /start command
async function handleStart(chatId: string) {
  const message = `🤖 <b>DarkToolsLabs DataBase Bot</b>

Bem-vindo ao bot de gerenciamento da base de dados!

<b>Comandos disponíveis:</b>

📋 <b>SITES</b>
/addsite [url] - [categoria] - [plataforma] - [gateway]
<code>Ex: /addsite www.exemplo.com - INFORMÁTICA - NUVEM SHOP - PagBank</code>

/bulkSites [lista]
<code>Adiciona múltiplos sites (um por linha)</code>

/sites [gateway ou categoria]
Lista sites filtrados

/search [termo]
Busca sites por URL, categoria ou gateway

📋 <b>BINS</b>
/addbin [nome] - [bins]
<code>Ex: /addbin Amazon - 553636, 498408</code>

/bulkbins [lista]
<code>Adiciona múltiplos BINs (um por linha)</code>

/bins [nome]
Busca BINs por nome

/allbins
Lista todos os BINs

📊 <b>ESTATÍSTICAS</b>
/stats
Mostra estatísticas da base

❓ <b>AJUDA</b>
/help
Mostra esta mensagem`;

  await sendTelegramMessage(chatId, message);
}

// Handle /help command
async function handleHelp(chatId: string) {
  await handleStart(chatId);
}

// Handle /stats command
async function handleStats(chatId: string) {
  const sites = await db.site.findMany();
  const bins = await db.knownBin.findMany();

  const totalSites = sites.length;
  const activeSites = sites.filter(s => s.status.includes('Ativo')).length;
  const inactiveSites = sites.filter(s => s.status === 'Desativado').length;
  const totalBins = bins.length;

  const gateways = [...new Set(sites.map(s => s.gateway))];
  const categories = [...new Set(sites.map(s => s.category))];

  const message = `📊 <b>Estatísticas da Base de Dados</b>

<b>SITES</b>
📦 Total: ${totalSites}
✅ Ativos: ${activeSites}
❌ Desativados: ${inactiveSites}

<b>BINS</b>
💳 Referências: ${totalBins}

<b>FILTROS</b>
🏪 Gateways: ${gateways.length}
📂 Categorias: ${categories.length}

<i>Atualizado em: ${new Date().toLocaleString('pt-BR')}</i>`;

  await sendTelegramMessage(chatId, message);
}

// Handle /addsite command
async function handleAddSite(chatId: string, args: string) {
  const site = parseSiteLine(args);
  
  if (!site) {
    await sendTelegramMessage(chatId, `❌ Formato inválido!\n\nUse: /addsite [url] - [categoria] - [plataforma] - [gateway]\nEx: /addsite www.exemplo.com - INFORMÁTICA - NUVEM SHOP - PagBank`);
    return;
  }

  try {
    const existing = await db.site.findFirst({ where: { url: site.url } });
    
    if (existing) {
      await sendTelegramMessage(chatId, `⚠️ Site já existe na base!\n\nURL: ${site.url}\nCategoria: ${existing.category}\nGateway: ${existing.gateway}`);
      return;
    }

    await db.site.create({
      data: {
        ...site,
        bins: '',
        status: 'Ativo (Verificado)'
      }
    });

    await sendTelegramMessage(chatId, `✅ <b>Site adicionado com sucesso!</b>\n\n🌐 URL: ${site.url}\n📂 Categoria: ${site.category}\n🏪 Plataforma: ${site.platform}\n💳 Gateway: ${site.gateway}`);
  } catch (error) {
    console.error('Error adding site:', error);
    await sendTelegramMessage(chatId, `❌ Erro ao adicionar site. Tente novamente.`);
  }
}

// Handle /bulksites command
async function handleBulkSites(chatId: string, args: string) {
  const lines = args.split('\n').filter(l => l.trim());
  
  if (lines.length === 0) {
    await sendTelegramMessage(chatId, `❌ Nenhum site encontrado!\n\nUse um site por linha no formato:\nurl - categoria - plataforma - gateway`);
    return;
  }

  const sites = lines.map(parseSiteLine).filter((s): s is NonNullable<typeof s> => s !== null);
  
  if (sites.length === 0) {
    await sendTelegramMessage(chatId, `❌ Nenhum site válido encontrado!`);
    return;
  }

  try {
    await db.site.createMany({
      data: sites.map(s => ({
        ...s,
        bins: '',
        status: 'Ativo (Verificado)'
      })),
      skipDuplicates: true
    });

    await sendTelegramMessage(chatId, `✅ <b>Importação concluída!</b>\n\n📊 Sites processados: ${lines.length}\n✅ Sites válidos: ${sites.length}`);
  } catch (error) {
    console.error('Error bulk adding sites:', error);
    await sendTelegramMessage(chatId, `❌ Erro na importação. Tente novamente.`);
  }
}

// Handle /sites command
async function handleSites(chatId: string, args: string) {
  const filter = args.trim().toLowerCase();
  
  const sites = await db.site.findMany({
    where: filter ? {
      OR: [
        { gateway: { contains: filter, mode: 'insensitive' } },
        { category: { contains: filter, mode: 'insensitive' } },
        { status: { contains: filter, mode: 'insensitive' } }
      ]
    } : undefined,
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  if (sites.length === 0) {
    await sendTelegramMessage(chatId, `📭 Nenhum site encontrado.`);
    return;
  }

  let message = `📋 <b>Sites${filter ? ` (${filter})` : ''}</b>\n\n`;
  
  sites.forEach((site, idx) => {
    const status = site.status.includes('Verificado') ? '✅' : site.status.includes('Externa') ? '🔵' : '❌';
    message += `${status} <a href="https://${site.url}">${site.url}</a>\n   📂 ${site.category} | 💳 ${site.gateway}\n\n`;
  });

  message += `\n<i>Mostrando ${sites.length} sites</i>`;
  
  await sendTelegramMessage(chatId, message);
}

// Handle /search command
async function handleSearch(chatId: string, args: string) {
  const term = args.trim().toLowerCase();
  
  if (!term) {
    await sendTelegramMessage(chatId, `❌ Digite um termo para buscar!\n\nEx: /search amazon`);
    return;
  }

  const sites = await db.site.findMany({
    where: {
      OR: [
        { url: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
        { gateway: { contains: term, mode: 'insensitive' } },
        { bins: { contains: term, mode: 'insensitive' } }
      ]
    },
    take: 20
  });

  if (sites.length === 0) {
    await sendTelegramMessage(chatId, `📭 Nenhum resultado para "${term}"`);
    return;
  }

  let message = `🔍 <b>Resultados para "${term}"</b>\n\n`;
  
  sites.forEach((site) => {
    const status = site.status.includes('Verificado') ? '✅' : site.status.includes('Externa') ? '🔵' : '❌';
    message += `${status} ${site.url}\n   📂 ${site.category} | 💳 ${site.gateway}\n`;
    if (site.bins) message += `   🔢 BINs: ${site.bins}\n`;
    message += `\n`;
  });

  message += `\n<i>Encontrados ${sites.length} resultados</i>`;
  
  await sendTelegramMessage(chatId, message);
}

// Handle /addbin command
async function handleAddBin(chatId: string, args: string) {
  const bin = parseBinLine(args);
  
  if (!bin) {
    await sendTelegramMessage(chatId, `❌ Formato inválido!\n\nUse: /addbin [nome] - [bins]\nEx: /addbin Amazon - 553636, 498408`);
    return;
  }

  try {
    const existing = await db.knownBin.findFirst({ where: { name: bin.name } });
    
    if (existing) {
      await db.knownBin.update({
        where: { id: existing.id },
        data: { bins: bin.bins }
      });
      await sendTelegramMessage(chatId, `✏️ <b>BIN atualizado!</b>\n\n📛 Nome: ${bin.name}\n🔢 BINs: ${bin.bins}`);
    } else {
      await db.knownBin.create({ data: bin });
      await sendTelegramMessage(chatId, `✅ <b>BIN adicionado!</b>\n\n📛 Nome: ${bin.name}\n🔢 BINs: ${bin.bins}`);
    }
  } catch (error) {
    console.error('Error adding bin:', error);
    await sendTelegramMessage(chatId, `❌ Erro ao adicionar BIN. Tente novamente.`);
  }
}

// Handle /bulkbins command
async function handleBulkBins(chatId: string, args: string) {
  const lines = args.split('\n').filter(l => l.trim());
  
  if (lines.length === 0) {
    await sendTelegramMessage(chatId, `❌ Nenhum BIN encontrado!\n\nUse um BIN por linha no formato:\nnome - bins`);
    return;
  }

  const bins = lines.map(parseBinLine).filter((b): b is NonNullable<typeof b> => b !== null);
  
  if (bins.length === 0) {
    await sendTelegramMessage(chatId, `❌ Nenhum BIN válido encontrado!`);
    return;
  }

  try {
    await db.knownBin.createMany({
      data: bins,
      skipDuplicates: true
    });

    await sendTelegramMessage(chatId, `✅ <b>Importação concluída!</b>\n\n📊 Linhas processadas: ${lines.length}\n✅ BINs válidos: ${bins.length}`);
  } catch (error) {
    console.error('Error bulk adding bins:', error);
    await sendTelegramMessage(chatId, `❌ Erro na importação. Tente novamente.`);
  }
}

// Handle /bins command
async function handleBins(chatId: string, args: string) {
  const name = args.trim().toLowerCase();
  
  if (!name) {
    await sendTelegramMessage(chatId, `❌ Digite o nome do BIN!\n\nEx: /bins amazon`);
    return;
  }

  const bins = await db.knownBin.findMany({
    where: {
      name: { contains: name, mode: 'insensitive' }
    },
    take: 10
  });

  if (bins.length === 0) {
    await sendTelegramMessage(chatId, `📭 Nenhum BIN encontrado para "${name}"`);
    return;
  }

  let message = `💳 <b>BINs encontrados</b>\n\n`;
  
  bins.forEach((bin) => {
    message += `📛 <b>${bin.name}</b>\n🔢 ${bin.bins}\n\n`;
  });

  await sendTelegramMessage(chatId, message);
}

// Handle /allbins command
async function handleAllBins(chatId: string) {
  const bins = await db.knownBin.findMany({
    take: 30,
    orderBy: { name: 'asc' }
  });

  if (bins.length === 0) {
    await sendTelegramMessage(chatId, `📭 Nenhum BIN cadastrado.`);
    return;
  }

  let message = `💳 <b>Todos os BINs (${bins.length})</b>\n\n`;
  
  bins.forEach((bin) => {
    message += `• <b>${bin.name}</b>: ${bin.bins}\n`;
  });

  await sendTelegramMessage(chatId, message);
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const userId = String(message.from?.id || '');
    const text = message.text.trim();

    // Check authorization
    if (!isUserAuthorized(userId)) {
      await sendTelegramMessage(chatId, `⛔ Acesso negado.\n\nSeu ID: ${userId}\nEntre em contato com o administrador para autorizar seu acesso.`);
      return NextResponse.json({ ok: true });
    }

    // Parse command
    const [command, ...args] = text.split(' ');
    const argsStr = args.join(' ');

    // Handle commands
    switch (command.toLowerCase()) {
      case '/start':
        await handleStart(chatId);
        break;
      case '/help':
        await handleHelp(chatId);
        break;
      case '/stats':
        await handleStats(chatId);
        break;
      case '/addsite':
        await handleAddSite(chatId, argsStr);
        break;
      case '/bulksites':
        await handleBulkSites(chatId, argsStr);
        break;
      case '/sites':
        await handleSites(chatId, argsStr);
        break;
      case '/search':
        await handleSearch(chatId, argsStr);
        break;
      case '/addbin':
        await handleAddBin(chatId, argsStr);
        break;
      case '/bulkbins':
        await handleBulkBins(chatId, argsStr);
        break;
      case '/bins':
        await handleBins(chatId, argsStr);
        break;
      case '/allbins':
        await handleAllBins(chatId);
        break;
      default:
        await sendTelegramMessage(chatId, `❓ Comando não reconhecido.\n\nUse /help para ver os comandos disponíveis.`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}

// GET endpoint to set webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const webhookUrl = searchParams.get('url');

  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 400 });
  }

  if (action === 'setWebhook' && webhookUrl) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl }),
        }
      );
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to set webhook' }, { status: 500 });
    }
  }

  if (action === 'getMe') {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
      );
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to get bot info' }, { status: 500 });
    }
  }

  return NextResponse.json({
    status: 'ok',
    message: 'DarkToolsLabs Telegram Bot API',
    endpoints: {
      webhook: 'POST /api/telegram',
      setWebhook: 'GET /api/telegram?action=setWebhook&url=YOUR_WEBHOOK_URL',
      getMe: 'GET /api/telegram?action=getMe'
    }
  });
}
