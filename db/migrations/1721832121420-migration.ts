import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721832121420 implements MigrationInterface {
  name = 'Migration1721832121420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "abstract_base_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_723c213727b1038d476972ce2f2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "organisation_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "value" character varying NOT NULL, "organisationId" uuid NOT NULL, CONSTRAINT "PK_3149ecbe39a50d9b76f09b9dd44" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "PK_e24d73349bc604e894d2472dd0b"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "org_id"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "org_email"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "full_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id")`
    );
    await queryRunner.query(`ALTER TABLE "organisation" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "email" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "UQ_a795e00e9d60fc3c2683caac33b" UNIQUE ("email")`
    );
    await queryRunner.query(`ALTER TABLE "organisation" ADD "industry" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "type" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "country" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "address" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "state" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "ownerId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "creatorId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "is_active" boolean`);
    await queryRunner.query(`ALTER TABLE "user" ADD "attempts_left" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "time_left" integer`);
    await queryRunner.query(`CREATE TYPE "public"."user_user_type_enum" AS ENUM('super_admin', 'admin', 'vendor')`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "user_type" "public"."user_user_type_enum" NOT NULL DEFAULT 'vendor'`
    );
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "description" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
    await queryRunner.query(
      `ALTER TABLE "organisation_preference" ADD CONSTRAINT "FK_2de786f3f89e650581916d67f86" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_d8df3e440ba45237db29bae7631" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_d8df3e440ba45237db29bae7631"`);
    await queryRunner.query(`ALTER TABLE "organisation_preference" DROP CONSTRAINT "FK_2de786f3f89e650581916d67f86"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "description" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_type"`);
    await queryRunner.query(`DROP TYPE "public"."user_user_type_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "time_left"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "attempts_left"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_active"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "creatorId"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "ownerId"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "isDeleted"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "state"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "type"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "industry"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "UQ_a795e00e9d60fc3c2683caac33b"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "full_name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "org_email" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "organisation" ADD "org_id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "PK_e24d73349bc604e894d2472dd0b" PRIMARY KEY ("org_id")`
    );
    await queryRunner.query(`DROP TABLE "organisation_preference"`);
    await queryRunner.query(`DROP TABLE "abstract_base_entity"`);
  }
}
