/*
  Warnings:

  - You are about to drop the column `name` on the `tbprojectcategories` table. All the data in the column will be lost.
  - Added the required column `category` to the `tbprojectcategories` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbprojectcategories" (
    "PK_category" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);
INSERT INTO "new_tbprojectcategories" ("PK_category", "actionHistory", "createdAt", "description", "updatedAt") SELECT "PK_category", "actionHistory", "createdAt", "description", "updatedAt" FROM "tbprojectcategories";
DROP TABLE "tbprojectcategories";
ALTER TABLE "new_tbprojectcategories" RENAME TO "tbprojectcategories";
CREATE UNIQUE INDEX "tbprojectcategories_category_key" ON "tbprojectcategories"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
