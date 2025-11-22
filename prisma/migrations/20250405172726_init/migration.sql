-- CreateTable
CREATE TABLE "Todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reminder_text" TEXT NOT NULL,
    "importance" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "event_from" DATETIME NOT NULL,
    "event_to" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Todo_title_idx" ON "Todo"("title");

-- CreateIndex
CREATE INDEX "CalendarEvent_title_idx" ON "CalendarEvent"("title");
