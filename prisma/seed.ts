import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.wettbewerber.createMany({
    data: [
      { id: 1, name: 'Keeta', farbe: '#FF6B35' },
      { id: 2, name: 'iFood', farbe: '#EA1D2C' },
      { id: 3, name: 'Both', farbe: '#000000' },
    ]
  })

  await prisma.kategorie.createMany({
    data: [
      { id: 1, name: 'Price Action' },
      { id: 2, name: 'Coupon' },
      { id: 3, name: 'Expansion' },
      { id: 4, name: 'Menu Change' },
      { id: 5, name: 'Marketing Campaign' },
      { id: 6, name: 'Partnership' },
      { id: 7, name: 'Other' },
    ]
  })

  await prisma.automatischerEintrag.create({
    data: {
      titel: 'Keeta expands to Belo Horizonte with free delivery',
      zusammenfassung: 'Keeta announces operations in BH with free delivery for a limited time.',
      url: 'https://example.com/keeta-bh',
      quelle: 'RSS',
      wettbewerberId: 1,
      kategorieId: 3,
      veroeffentlicht: new Date('2026-05-01'),
    }
  })

  await prisma.datenquelle.create({
    data: {
      name: 'Google News Keeta Brasil',
      typ: 'RSS',
      urlOderConfig: 'https://news.google.com/rss/search?q=keeta+brasil&hl=pt-BR&gl=BR&ceid=BR:pt',
      aktiv: true,
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })