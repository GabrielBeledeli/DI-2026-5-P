import { IsEnum, IsArray, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VendaStatus } from '@prisma/client';

export class CreateVendaItemDto {
  @IsNumber()
  produtoId: number;

  @IsNumber()
  @Min(1)
  quantidade: number;

  @IsOptional()
  @IsNumber()
  precoUnitario?: number;
}

export class CreateVendaDto {
  @IsNumber()
  clienteId: number;

  @IsEnum(VendaStatus)
  status: VendaStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVendaItemDto)
  itens: CreateVendaItemDto[];
}
