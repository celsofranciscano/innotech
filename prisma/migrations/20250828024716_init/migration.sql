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
    "profession" TEXT,
    "specialization" TEXT,
    "summary" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "websiteUrl" TEXT,
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
    "FK_user" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "urlImage" TEXT,
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

-- CreateTable
CREATE TABLE "tbevaluationcriteria" (
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
    CONSTRAINT "tbjurors_FK_call_fkey" FOREIGN KEY ("FK_call") REFERENCES "tbcalls" ("PK_call") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbjurors_FK_user_fkey" FOREIGN KEY ("FK_user") REFERENCES "tbusers" ("PK_user") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tbprojecttypes" (
    "PK_type" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbprojectcategories" (
    "PK_category" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbprojectstatus" (
    "PK_status" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "actionHistory" JSONB
);

-- CreateTable
CREATE TABLE "tbprojects" (
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
    CONSTRAINT "tbreviewdetails_FK_assignment_fkey" FOREIGN KEY ("FK_assignment") REFERENCES "tbjurors" ("PK_assignment") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tbreviewdetails_FK_project_fkey" FOREIGN KEY ("FK_project") REFERENCES "tbprojects" ("PK_project") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tbprivileges_privilege_key" ON "tbprivileges"("privilege");

-- CreateIndex
CREATE UNIQUE INDEX "tbusers_email_key" ON "tbusers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbdevices_FK_user_key" ON "tbdevices"("FK_user");

-- CreateIndex
CREATE UNIQUE INDEX "tbprojecttypes_type_key" ON "tbprojecttypes"("type");

-- CreateIndex
CREATE UNIQUE INDEX "tbprojectcategories_category_key" ON "tbprojectcategories"("category");

-- CreateIndex
CREATE UNIQUE INDEX "tbprojectstatus_status_key" ON "tbprojectstatus"("status");
