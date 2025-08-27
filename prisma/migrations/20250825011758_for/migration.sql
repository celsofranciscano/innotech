/*
  Warnings:

  - You are about to drop the column `name` on the `tbprojectstatus` table. All the data in the column will be lost.
  - Added the required column `status` to the `tbprojectstatus` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbprojectstatus" (
    "PK_status" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);
INSERT INTO "new_tbprojectstatus" ("PK_status", "actionHistory", "createdAt", "description", "updatedAt") SELECT "PK_status", "actionHistory", "createdAt", "description", "updatedAt" FROM "tbprojectstatus";
DROP TABLE "tbprojectstatus";
ALTER TABLE "new_tbprojectstatus" RENAME TO "tbprojectstatus";
CREATE UNIQUE INDEX "tbprojectstatus_status_key" ON "tbprojectstatus"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
