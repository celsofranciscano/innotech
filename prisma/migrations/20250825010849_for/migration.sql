/*
  Warnings:

  - You are about to drop the column `name` on the `tbprojecttypes` table. All the data in the column will be lost.
  - Added the required column `type` to the `tbprojecttypes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbcalls" ADD COLUMN "urlImage" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbprojecttypes" (
    "PK_type" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);
INSERT INTO "new_tbprojecttypes" ("PK_type", "actionHistory", "createdAt", "description", "updatedAt") SELECT "PK_type", "actionHistory", "createdAt", "description", "updatedAt" FROM "tbprojecttypes";
DROP TABLE "tbprojecttypes";
ALTER TABLE "new_tbprojecttypes" RENAME TO "tbprojecttypes";
CREATE UNIQUE INDEX "tbprojecttypes_type_key" ON "tbprojecttypes"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
