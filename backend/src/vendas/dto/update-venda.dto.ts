import { PartialType } from '@nestjs/mapped-types';
import { CreateVendaDto } from './create-venda.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { VendaStatus } from '@prisma/client';

export class UpdateVendaDto extends PartialType(CreateVendaDto) {
  @IsOptional()
  @IsEnum(VendaStatus)
  status?: VendaStatus;
}
