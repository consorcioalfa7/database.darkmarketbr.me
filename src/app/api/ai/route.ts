import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// AI Configuration from Environment
const AI_PROVIDER = process.env.AI_PROVIDER || 'zai'; // 'zai' | 'openrouter'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
const OPENROUTER_SITE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'database.darkmarketbr.me';
const OPENROUTER_SITE_NAME = 'DarkToolsLabs DataBase';

// Initialize ZAI instance (cached)
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// OpenRouter API call
async function callOpenRouter(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': `https://${OPENROUTER_SITE_URL}`,
      'X-Title': OPENROUTER_SITE_NAME,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Unified AI completion
async function getAICompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (AI_PROVIDER === 'openrouter') {
    return callOpenRouter(messages);
  } else {
    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    });
    return completion.choices[0]?.message?.content || '';
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function GET() {
  return NextResponse.json({
    provider: AI_PROVIDER,
    model: AI_PROVIDER === 'openrouter' ? OPENROUTER_MODEL : 'zai-default',
    configured: AI_PROVIDER === 'openrouter' ? !!OPENROUTER_API_KEY : true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, messages } = body as {
      action: 'analyze' | 'chat';
      data?: string;
      messages?: Message[];
    };

    // Get current database state for context
    const sites = await db.site.findMany({ take: 100 });
    const knownBins = await db.knownBin.findMany();

    const dbContext = `
BASE DE DADOS ATUAL:
- Total de Sites: ${sites.length}
- Sites Ativos (Verificados): ${sites.filter(s => s.status === 'Ativo (Verificado)').length}
- Sites Ativos (Inf. Externa): ${sites.filter(s => s.status === 'Ativo (Inf. Externa)').length}
- Sites Desativados: ${sites.filter(s => s.status === 'Desativado').length}
- Total de Referências BIN: ${knownBins.length}

CATEGORIAS DISPONÍVEIS: ${[...new Set(sites.map(s => s.category))].join(', ')}
GATEWAYS DISPONÍVEIS: ${[...new Set(sites.map(s => s.gateway))].join(', ')}
PLATAFORMAS DISPONÍVEIS: ${[...new Set(sites.map(s => s.platform))].join(', ')}
`;

    if (action === 'analyze' && data) {
      // Analyze raw data and extract structured information
      const systemPrompt = `Você é um especialista em análise de dados para um sistema de gerenciamento de sites e BINs.
Sua tarefa é analisar dados brutos e extrair informações estruturadas.

${dbContext}

REGRAS DE EXTRAÇÃO:
1. Identifique URLs de sites (formato: www.dominio.com ou dominio.com)
2. Identifique categorias (ex: INFORMÁTICA, CELULARES, GAMES, ELETRÔNICOS)
3. Identifique plataformas (ex: NUVEM SHOP, SHOPIFY, WIX)
4. Identifique gateways de pagamento (ex: PagBank, PagarMe, Mercado Pago)
5. Identifique BINs (números de 6 dígitos de cartões)

RETORNE SEMPRE UM JSON VÁLIDO com esta estrutura:
{
  "sites": [
    {
      "url": "www.exemplo.com",
      "category": "CATEGORIA",
      "platform": "PLATAFORMA",
      "gateway": "GATEWAY"
    }
  ],
  "bins": [
    {
      "name": "Nome do Comércio",
      "bins": "123456, 654321"
    }
  ],
  "summary": "Resumo do que foi encontrado",
  "suggestions": "Sugestões de melhorias ou observações"
}

Se não encontrar dados válidos, retorne arrays vazios e explique no summary.`;

      const response = await getAICompletion([
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: `Analise os seguintes dados brutos e extraia as informações:\n\n${data}` }
      ]);

      // Try to parse JSON from response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            result: parsed,
            raw: response,
            provider: AI_PROVIDER,
            model: AI_PROVIDER === 'openrouter' ? OPENROUTER_MODEL : 'zai-default',
          });
        }
      } catch {
        // Return raw response if JSON parsing fails
      }

      return NextResponse.json({
        success: true,
        result: { sites: [], bins: [], summary: response, suggestions: '' },
        raw: response,
        provider: AI_PROVIDER,
        model: AI_PROVIDER === 'openrouter' ? OPENROUTER_MODEL : 'zai-default',
      });
    }

    if (action === 'chat' && messages) {
      // Chat with AI about the database
      const systemPrompt = `Você é o assistente IA do DarkToolsLabs DataBase, um sistema de gerenciamento de sites e BINs.

${dbContext}

SEU PAPEL:
- Responder perguntas sobre a base de dados
- Ajudar a encontrar sites por categoria, gateway ou status
- Sugerir BINs para sites específicos
- Fornecer estatísticas e insights
- Ajudar a organizar e analisar dados

DICIONÁRIO DE BINs CONHECIDOS:
${knownBins.map(b => `- ${b.name}: ${b.bins}`).join('\n')}

EXEMPLOS DE SITES (últimos 20):
${sites.slice(0, 20).map(s => `- ${s.url} | ${s.category} | ${s.gateway} | ${s.status}`).join('\n')}

INSTRUÇÕES:
- Seja útil e objetivo
- Responda em português do Brasil
- Use formatação Markdown quando apropriado
- Se não souber algo, diga que não tem essa informação na base
- Sempre que citar BINs, mostre claramente os números`;

      const conversationMessages = [
        { role: 'assistant', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];

      const response = await getAICompletion(conversationMessages);

      return NextResponse.json({
        success: true,
        response,
        provider: AI_PROVIDER,
        model: AI_PROVIDER === 'openrouter' ? OPENROUTER_MODEL : 'zai-default',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({
      error: 'Failed to process AI request',
      details: error instanceof Error ? error.message : 'Unknown error',
      provider: AI_PROVIDER,
    }, { status: 500 });
  }
}
