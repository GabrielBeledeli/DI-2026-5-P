/*
  Warnings:

  - You are about to drop the column `data` on the `vendas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "data",
ADD COLUMN     "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
