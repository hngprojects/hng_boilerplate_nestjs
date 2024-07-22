import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721580299155 implements MigrationInterface {
  name = 'Migration1721580299155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying NOT NULL`);
  }
}
