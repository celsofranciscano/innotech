-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbjurors" (
    "PK_assignment" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_call" INTEGER NOT NULL,
    "FK_user" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbjurors_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbjurors_FK_user_fkey" FOREIGN KEY ("FK_user") REFERENCES "tbusers" ("PK_user") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tbjurors" ("FK_call", "FK_user", "PK_assignment", "actionHistory", "assignedAt", "createdAt", "notes", "updatedAt") SELECT "FK_call", "FK_user", "PK_assignment", "actionHistory", "assignedAt", "createdAt", "notes", "updatedAt" FROM "tbjurors";
DROP TABLE "tbjurors";
ALTER TABLE "new_tbjurors" RENAME TO "tbjurors";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
