import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '../../../lib/db'

export async function POST() {
  const quellen = await prisma.datenquelle.findMany({ where: { aktiv: true, typ: 'RSS' } })
  let newEntries = 0

  for (const q of quellen) {
    try {
      const { data } = await axios.get(q.urlOderConfig, { timeout: 8000 })
      const $ = cheerio.load(data, { xmlMode: true })
      const items = $('item').toArray()

      for (const item of items) {
        const titel = $(item).find('title').text().trim()
        const link = $(item).find('link').text().trim()
        const pubDate = $(item).find('pubDate').text()
        const description = $(item).find('description').text()

        if (!titel || !link) continue
        const exists = await prisma.automatischerEintrag.findFirst({ where: { url: link } })
        if (!exists) {
          const wId = q.name.toLowerCase().includes('keeta') ? 1 : 2
          await prisma.automatischerEintrag.create({
            data: {
              titel,
              zusammenfassung: description?.replace(/<[^>]*>/g, '').slice(0, 300),
              url: link,
              quelle: 'RSS',
              wettbewerberId: wId,
              veroeffentlicht: pubDate ? new Date(pubDate) : new Date(),
            },
          })
          newEntries++
        }
      }
    } catch (err) {
      console.error(`Error fetching ${q.name}:`, err)
    }
  }

  return NextResponse.json({ success: true, newEntries })
}