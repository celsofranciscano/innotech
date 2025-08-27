-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tbprojects" (
    "PK_project" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_call" INTEGER,
    "FK_type" INTEGER,
    "FK_category" INTEGER,
    "FK_status" INTEGER DEFAULT 1,
    "title" TEXT NOT NULL,
    "shortSummary" TEXT,
    "description" TEXT NOT NULL,
    "objectives" TEXT,
    "problem" TEXT,
    "beneficiaries" TEXT,
    "expectedImpact" TEXT,
    "scalability" TEXT,
    "coverImage" TEXT,
    "repoUrl" TEXT,
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "pdfUrl" TEXT,
    "technologies" JSONB,
    "tags" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbprojects_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_type_fkey" FOREIGN KEY ("FK_type") REFERENCES "tbprojecttypes" ("PK_type") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_category_fkey" FOREIGN KEY ("FK_category") REFERENCES "tbprojectcategories" ("PK_category") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_status_fkey" FOREIGN KEY ("FK_status") REFERENCES "tbprojectstatus" ("PK_status") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tbprojects" ("FK_call", "FK_category", "FK_status", "FK_type", "PK_project", "actionHistory", "beneficiaries", "coverImage", "createdAt", "demoUrl", "description", "expectedImpact", "isFeatured", "objectives", "pdfUrl", "problem", "repoUrl", "scalability", "shortSummary", "tags", "technologies", "title", "updatedAt", "videoUrl") SELECT "FK_call", "FK_category", "FK_status", "FK_type", "PK_project", "actionHistory", "beneficiaries", "coverImage", "createdAt", "demoUrl", "description", "expectedImpact", "isFeatured", "objectives", "pdfUrl", "problem", "repoUrl", "scalability", "shortSummary", "tags", "technologies", "title", "updatedAt", "videoUrl" FROM "tbprojects";
DROP TABLE "tbprojects";
ALTER TABLE "new_tbprojects" RENAME TO "tbprojects";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
