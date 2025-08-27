/*
  Warnings:

  - You are about to drop the column `name` on the `tbevaluationcriteria` table. All the data in the column will be lost.
  - Added the required column `criteria` to the `tbevaluationcriteria` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbevaluationcriteria" (
    "PK_criteria" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_call" INTEGER NOT NULL,
    "criteria" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbevaluationcriteria_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tbevaluationcriteria" ("FK_call", "PK_criteria", "actionHistory", "createdAt", "description", "maxScore", "updatedAt") SELECT "FK_call", "PK_criteria", "actionHistory", "createdAt", "description", "maxScore", "updatedAt" FROM "tbevaluationcriteria";
DROP TABLE "tbevaluationcriteria";
ALTER TABLE "new_tbevaluationcriteria" RENAME TO "tbevaluationcriteria";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
