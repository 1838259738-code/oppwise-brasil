-- CreateTable
CREATE TABLE "Wettbewerber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "farbe" TEXT NOT NULL DEFAULT '#000000'
);

-- CreateTable
CREATE TABLE "Kategorie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "wettbewerberId" INTEGER NOT NULL,
    "kategorieId" INTEGER NOT NULL,
    "aufnahmeDatum" DATETIME NOT NULL,
    "dateiPfade" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Material_wettbewerberId_fkey" FOREIGN KEY ("wettbewerberId") REFERENCES "Wettbewerber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Material_kategorieId_fkey" FOREIGN KEY ("kategorieId") REFERENCES "Kategorie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AutomatischerEintrag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titel" TEXT NOT NULL,
    "zusammenfassung" TEXT,
    "url" TEXT,
    "quelle" TEXT NOT NULL,
    "wettbewerberId" INTEGER NOT NULL,
    "kategorieId" INTEGER,
    "veroeffentlicht" DATETIME,
    "erfasstAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "istGelesen" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AutomatischerEintrag_wettbewerberId_fkey" FOREIGN KEY ("wettbewerberId") REFERENCES "Wettbewerber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AutomatischerEintrag_kategorieId_fkey" FOREIGN KEY ("kategorieId") REFERENCES "Kategorie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Datenquelle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "urlOderConfig" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MonitoringKeyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyword" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "FieldIntel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titel" TEXT NOT NULL,
    "wettbewerberId" INTEGER NOT NULL,
    "stadt" TEXT NOT NULL,
    "screenType" TEXT NOT NULL,
    "userProfile" TEXT NOT NULL,
    "tags" TEXT,
    "dateiPfade" TEXT NOT NULL,
    "notizen" TEXT,
    "extractedText" TEXT,
    "priceFindings" TEXT,
    "strategyTags" TEXT,
    "aiSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FieldIntel_wettbewerberId_fkey" FOREIGN KEY ("wettbewerberId") REFERENCES "Wettbewerber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Wettbewerber_name_key" ON "Wettbewerber"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Kategorie_name_key" ON "Kategorie"("name");
