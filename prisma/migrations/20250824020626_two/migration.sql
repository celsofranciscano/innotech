-- CreateTable
CREATE TABLE "tbprivileges" (
    "PK_privilege" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "privilege" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbusers" (
    "PK_user" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_privilege" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "password" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbusers_FK_privilege_fkey" FOREIGN KEY ("FK_privilege") REFERENCES "tbprivileges" ("PK_privilege") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tbdevices" (
    "PK_device" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_user" INTEGER NOT NULL,
    "devices" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "tbdevices_FK_user_fkey" FOREIGN KEY ("FK_user") REFERENCES "tbusers" ("PK_user") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tbcalls" (
    "PK_call" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbevaluationcriteria" (
    "PK_criteria" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_call" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbevaluationcriteria_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tbjurorassignments" (
    "PK_assignment" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_call" INTEGER NOT NULL,
    "FK_user" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbjurorassignments_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tbprojecttypes" (
    "PK_type" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbprojectcategories" (
    "PK_category" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbprojectstatus" (
    "PK_status" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbprojects" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB,
    CONSTRAINT "tbprojects_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_type_fkey" FOREIGN KEY ("FK_type") REFERENCES "tbprojecttypes" ("PK_type") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_category_fkey" FOREIGN KEY ("FK_category") REFERENCES "tbprojectcategories" ("PK_category") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tbprojects_FK_status_fkey" FOREIGN KEY ("FK_status") REFERENCES "tbprojectstatus" ("PK_status") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tbprojectmembers" (
    "PK_member" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FK_project" INTEGER NOT NULL,
    "FK_user" INTEGER NOT NULL,
    "role" TEXT,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "actionHistory" JSONB,
    CONSTRAINT "tbprojectmembers_FK_project_fkey" FOREIGN KEY ("FK_project") REFERENCES "tbprojects" ("PK_project") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbprojectmembers_FK_user_fkey" FOREIGN KEY ("FK_user") REFERENCES "tbusers" ("PK_user") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tbreviewdetails" (
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
    CONSTRAINT "tbreviewdetails_FK_assignment_fkey" FOREIGN KEY ("FK_assignment") REFERENCES "tbjurorassignments" ("PK_assignment") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbreviewdetails_FK_project_fkey" FOREIGN KEY ("FK_project") REFERENCES "tbprojects" ("PK_project") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tbprivileges_privilege_key" ON "tbprivileges"("privilege");

-- CreateIndex
CREATE UNIQUE INDEX "tbusers_email_key" ON "tbusers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbdevices_FK_user_key" ON "tbdevices"("FK_user");

-- CreateIndex
CREATE UNIQUE INDEX "tbprojecttypes_name_key" ON "tbprojecttypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbprojectcategories_name_key" ON "tbprojectcategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbprojectstatus_name_key" ON "tbprojectstatus"("name");
