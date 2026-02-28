import { db } from '../src/lib/db';

const binsData = [
  { name: "Amazon", bins: "553636, 498408, 552640, 550209, 516292" },
  { name: "Picpay", bins: "546479, 548262, 407843, 650597" },
  { name: "Boss", bins: "522840" },
  { name: "Bradesco Platinum", bins: "406655" },
  { name: "Airbnb", bins: "522626, 526326, 535798" },
  { name: "Casas Bahia", bins: "651652, 550209, 651653" },
  { name: "Caixa", bins: "439384" },
  { name: "Centauro", bins: "404024, 550209, 616292" },
  { name: "Decolar/Renner", bins: "544315, 550209" },
  { name: "Mercado Livre", bins: "651652, 230650, 536119, 550209, 492061, 499818, 406669" },
  { name: "Fastshop", bins: "530033, 523343, 655001, 553636" },
  { name: "Fort", bins: "230888" },
  { name: "Gringo", bins: "540593" },
  { name: "Gringo/Amazon", bins: "526326, 550209, 516292" },
  { name: "iFood", bins: "407843, 515894, 512707, 374769" },
  { name: "Ingresse", bins: "223525" },
  { name: "Ingressos.com", bins: "512840" },
  { name: "Amazon (Alt)", bins: "515590, 523431, 492061" },
  { name: "Itaú Facul", bins: "439354" },
  { name: "Kabum", bins: "422007" },
  { name: "Lacoste", bins: "545823, 492061" },
  { name: "Magalu", bins: "498408, 499818" },
  { name: "McDonald's", bins: "526326, 515894" },
  { name: "Mercado Pago Jurídico", bins: "485464, 459384" },
  { name: "Motorola", bins: "520048" },
  { name: "PayPal", bins: "547408" },
  { name: "Rio Card", bins: "485464" },
  { name: "Safra Unisuam", bins: "439354" },
  { name: "Shein", bins: "407832, 531681, 421960, 499818, 410127, 406655" },
  { name: "Shopee", bins: "520048, 514945, 550209, 516292" },
  { name: "Zé Delivery", bins: "230650" },
  { name: "Link Recarga Pay", bins: "650905, 650901, 533595, 230550" },
  { name: "Link Mercado Pago", bins: "534696, 516292, 553636, 498408, 531249, 553665, 407843, 406168" },
  { name: "Link Picpay", bins: "552590, 650914, 554612" },
  { name: "Link Rede", bins: "650594, 552929, 650905, 498581" },
  { name: "Link Getnet", bins: "425850, 499818" },
  { name: "Link PagBank", bins: "606292, 234087, 651677, 230550" },
  { name: "Link Sumup", bins: "407843" },
  { name: "Link Infinity", bins: "650507, 512707" },
  { name: "Link Pagamento Nubank", bins: "489391" }
];

async function importBins() {
  console.log('🚀 Iniciando importação de BINs...\n');

  let imported = 0;
  let updated = 0;

  for (const bin of binsData) {
    try {
      // Check if already exists
      const existing = await db.knownBin.findFirst({
        where: { name: bin.name }
      });

      if (existing) {
        // Update existing
        await db.knownBin.update({
          where: { id: existing.id },
          data: { bins: bin.bins }
        });
        console.log(`✏️  Atualizado: ${bin.name}`);
        updated++;
      } else {
        // Create new
        await db.knownBin.create({
          data: bin
        });
        console.log(`✅ Criado: ${bin.name}`);
        imported++;
      }
    } catch (error) {
      console.error(`❌ Erro em ${bin.name}:`, error);
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Novos: ${imported}`);
  console.log(`   ✏️  Atualizados: ${updated}`);
  console.log(`   📦 Total processado: ${binsData.length}`);

  process.exit(0);
}

importBins().catch(console.error);
