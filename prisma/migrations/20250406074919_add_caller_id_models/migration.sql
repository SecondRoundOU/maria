-- CreateTable
CREATE TABLE "CallerLookup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "lookupResult" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CallRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "callSid" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CallerLookup_phoneNumber_idx" ON "CallerLookup"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CallRecord_callSid_key" ON "CallRecord"("callSid");

-- CreateIndex
CREATE INDEX "CallRecord_callSid_idx" ON "CallRecord"("callSid");
