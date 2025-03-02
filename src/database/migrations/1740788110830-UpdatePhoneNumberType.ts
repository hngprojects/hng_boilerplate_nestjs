import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePhoneNumberType1740788110830 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE contact ALTER COLUMN phone TYPE VARCHAR(20) USING phone::text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE contact ALTER COLUMN phone TYPE INTEGER USING phone::integer`);
  }
}
