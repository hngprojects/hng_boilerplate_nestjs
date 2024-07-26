import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721981156329 implements MigrationInterface {
  name = 'Migration1721981156329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_d8df3e440ba45237db29bae7631"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df"`);
    await queryRunner.query(`CREATE TYPE "public"."users_user_type_enum" AS ENUM('super_admin', 'admin', 'vendor')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "is_active" boolean, "attempts_left" integer, "time_left" integer, "secret" character varying, "is_2fa_enabled" boolean NOT NULL DEFAULT false, "user_type" "public"."users_user_type_enum" NOT NULL DEFAULT 'vendor', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_d8df3e440ba45237db29bae7631" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_d8df3e440ba45237db29bae7631"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_user_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_d8df3e440ba45237db29bae7631" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
