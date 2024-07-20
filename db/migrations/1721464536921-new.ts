import { MigrationInterface, QueryRunner } from "typeorm";

export class New1721464536921 implements MigrationInterface {
    name = 'New1721464536921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "is_active" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_active"`);
    }

}
