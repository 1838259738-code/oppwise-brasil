import { prisma } from '../../lib/db'
import DatenquellenClient from './DatenquellenClient'

export default async function DataSourcesPage() {
  const [datenquellen, keywords] = await Promise.all([
    prisma.datenquelle.findMany(),
    prisma.monitoringKeyword.findMany(),
  ])
  return <DatenquellenClient quellen={datenquellen} keywords={keywords} />
}