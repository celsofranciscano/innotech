/*
  Warnings:

  - Added the required column `FK_user` to the `tbcalls` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbcalls" (
    "PK_call" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_user" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "pdfGuidelines" TEXT,
    "submissionOpen" DATETIME NOT NULL,
    "submissionClose" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isIndividual" BOOLEAN NOT NULL DEFAULT true,
    "allowedProjectTypes" JSONB,
    "allowedCategories" JSONB,
    "minTeamMembers" INTEGER,
    "maxTeamMembers" INTEGER,
    "minExperienceLevel" TEXT,
    "minTechRequirements" JSONB,
    "prizes" JSONB,
    "materia" TEXT,
    "semestre" TEXT,
    "resultsAnnouncement" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbcalls_FK_user_fkey" FOREIGN KEY ("FK_user") REFERENCES "tbusers" ("PK_user") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tbcalls" ("PK_call", "actionHistory", "allowedCategories", "allowedProjectTypes", "createdAt", "description", "isActive", "isIndividual", "materia", "maxTeamMembers", "minExperienceLevel", "minTeamMembers", "minTechRequirements", "note", "pdfGuidelines", "prizes", "resultsAnnouncement", "semestre", "submissionClose", "submissionOpen", "title", "updatedAt") SELECT "PK_call", "actionHistory", "allowedCategories", "allowedProjectTypes", "createdAt", "description", "isActive", "isIndividual", "materia", "maxTeamMembers", "minExperienceLevel", "minTeamMembers", "minTechRequirements", "note", "pdfGuidelines", "prizes", "resultsAnnouncement", "semestre", "submissionClose", "submissionOpen", "title", "updatedAt" FROM "tbcalls";
DROP TABLE "tbcalls";
ALTER TABLE "new_tbcalls" RENAME TO "tbcalls";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
