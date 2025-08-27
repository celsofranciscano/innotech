/*
  Warnings:

  - You are about to drop the `tbjurorassignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "tbjurorassignments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "tbjurors" (
    "PK_assignment" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_call" INTEGER NOT NULL,
    "FK_user" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbjurors_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbreviewdetails" (
    "PK_detail" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_criteria" INTEGER NOT NULL,
    "FK_assignment" INTEGER NOT NULL,
    "FK_project" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbreviewdetails_FK_criteria_fkey" FOREIGN KEY ("FK_criteria") REFERENCES "tbevaluationcriteria" ("PK_criteria") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbreviewdetails_FK_assignment_fkey" FOREIGN KEY ("FK_assignment") REFERENCES "tbjurors" ("PK_assignment") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbreviewdetails_FK_project_fkey" FOREIGN KEY ("FK_project") REFERENCES "tbprojects" ("PK_project") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tbreviewdetails" ("FK_assignment", "FK_criteria", "FK_project", "PK_detail", "actionHistory", "comments", "createdAt", "score", "updatedAt") SELECT "FK_assignment", "FK_criteria", "FK_project", "PK_detail", "actionHistory", "comments", "createdAt", "score", "updatedAt" FROM "tbreviewdetails";
DROP TABLE "tbreviewdetails";
ALTER TABLE "new_tbreviewdetails" RENAME TO "tbreviewdetails";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
