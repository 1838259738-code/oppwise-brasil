import { prisma } from '../../lib/db'
import BibliothekClient from './BibliothekClient'

export default async function LibraryPage() {
  const materialien = await prisma.material.findMany({
    orderBy: { createdAt: 'desc' },
    include: { wettbewerber: true, kategorie: true },
  })
  return <BibliothekClient materialien={materialien} />
}