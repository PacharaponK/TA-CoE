import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ta, TaSchema } from './ta.schema';
import { TasService } from './tas.service';
import { TasController } from './tas.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Ta.name, schema: TaSchema }])],
  controllers: [TasController],
  providers: [TasService],
  exports: [TasService],
})
export class TasModule {}
