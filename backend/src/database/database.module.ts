import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (): MongooseModuleOptions => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inspmail',
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });

          connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
          });

          connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
          });

          return connection;
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
