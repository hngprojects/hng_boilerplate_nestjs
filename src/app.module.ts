// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { createClient } from '@supabase/supabase-js'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'DB_HOST',
      port: parseInt('DB_PORT'),
      username: 'DB_USERNAME',
      password: 'DB_PASSWORD',
      database: 'DB_DATABASE',
      entities: [Product],
      synchronize: true,
    }),
    ProductsModule,
  ],
})
export class AppModule {}