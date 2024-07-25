import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1721889605313 implements MigrationInterface {
    name = 'Migration1721889605313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is2faEnabled"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roleId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_active" boolean`);
        await queryRunner.query(`ALTER TABLE "user" ADD "attempts_left" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "time_left" integer`);
        await queryRunner.query(`CREATE TYPE "public"."user_user_type_enum" AS ENUM('super_admin', 'admin', 'vendor')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "user_type" "public"."user_user_type_enum" NOT NULL DEFAULT 'vendor'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_type"`);
        await queryRunner.query(`DROP TYPE "public"."user_user_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "time_left"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "attempts_left"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "roleId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is2faEnabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
