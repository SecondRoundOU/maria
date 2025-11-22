-- CreateTable
CREATE TABLE "CallerDatabase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "licensePlate" TEXT,
    "type" TEXT DEFAULT 'personal',
    "spamLikelihood" TEXT DEFAULT 'low',
    "location" TEXT DEFAULT 'Unknown',
    "carrier" TEXT DEFAULT 'Unknown',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CallerDatabase_phoneNumber_key" ON "CallerDatabase"("phoneNumber");

-- CreateIndex
CREATE INDEX "CallerDatabase_phoneNumber_idx" ON "CallerDatabase"("phoneNumber");

-- CreateIndex
CREATE INDEX "CallerDatabase_licensePlate_idx" ON "CallerDatabase"("licensePlate");
