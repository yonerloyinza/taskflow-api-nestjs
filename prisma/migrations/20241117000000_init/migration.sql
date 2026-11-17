-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pendiente', 'en_curso', 'hecha');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('baja', 'media', 'alta');

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "status" "TaskStatus" NOT NULL DEFAULT 'pendiente',
    "priority" "TaskPriority" NOT NULL DEFAULT 'media',
    "assignee" VARCHAR(100) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_assignee_idx" ON "Task"("assignee");