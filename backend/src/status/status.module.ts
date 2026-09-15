import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [AuthModule, PrismaModule],
    providers: [StatusGateway],
})
export class StatusModule {}
