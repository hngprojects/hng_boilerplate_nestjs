import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721758210801 implements MigrationInterface {
  name = 'Migration1721758210801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "secret" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "is_2fa_enabled" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_2fa_enabled"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "secret"`);
  }
}
