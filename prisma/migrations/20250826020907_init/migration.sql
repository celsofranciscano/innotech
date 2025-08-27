/*
  Warnings:

  - You are about to drop the column `beneficiaries` on the `tbprojects` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tbprojects` table. All the data in the column will be lost.
  - You are about to drop the column `expectedImpact` on the `tbprojects` table. All the data in the column will be lost.
  - You are about to drop the column `objectives` on the `tbprojects` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `tbprojects` table. All the data in the column will be lost.
  - You are about to drop the column `scalability` on the `tbprojects` table. All the data in the column will be lost.
  - Made the column `FK_call` on table `tbprojects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `FK_category` on table `tbprojects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `FK_status` on table `tbprojects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `FK_type` on table `tbprojects` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbprojects" (
    "PK_project" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_call" INTEGER NOT NULL,
    "FK_type" INTEGER NOT NULL,
    "FK_category" INTEGER NOT NULL,
    "FK_status" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "shortSummary" TEXT,
    "problem" TEXT,
    "solution" TEXT,
    "coverImage" TEXT,
    "repoUrl" TEXT,
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "technologies" JSONB,
    "tags" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbprojects_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_type_fkey" FOREIGN KEY ("FK_type") REFERENCES "tbprojecttypes" ("PK_type") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_category_fkey" FOREIGN KEY ("FK_category") REFERENCES "tbprojectcategories" ("PK_category") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_status_fkey" FOREIGN KEY ("FK_status") REFERENCES "tbprojectstatus" ("PK_status") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tbprojects" ("FK_call", "FK_category", "FK_status", "FK_type", "PK_project", "actionHistory", "coverImage", "createdAt", "demoUrl", "isFeatured", "isPublished", "problem", "repoUrl", "shortSummary", "tags", "technologies", "title", "updatedAt", "videoUrl") SELECT "FK_call", "FK_category", "FK_status", "FK_type", "PK_project", "actionHistory", "coverImage", "createdAt", "demoUrl", "isFeatured", "isPublished", "problem", "repoUrl", "shortSummary", "tags", "technologies", "title", "updatedAt", "videoUrl" FROM "tbprojects";
DROP TABLE "tbprojects";
ALTER TABLE "new_tbprojects" RENAME TO "tbprojects";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
