import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1721892746981 implements MigrationInterface {
    name = 'Migration1721892746981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "organisation_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "value" character varying NOT NULL, "organisationId" uuid NOT NULL, CONSTRAINT "PK_3149ecbe39a50d9b76f09b9dd44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organisation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text NOT NULL, "email" character varying NOT NULL, "industry" character varying NOT NULL, "type" character varying NOT NULL, "country" character varying NOT NULL, "address" text NOT NULL, "state" character varying NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "ownerId" uuid NOT NULL, "creatorId" uuid NOT NULL, CONSTRAINT "UQ_a795e00e9d60fc3c2683caac33b" UNIQUE ("email"), CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_user_type_enum" AS ENUM('super_admin', 'admin', 'vendor')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "user_type" "public"."user_user_type_enum" NOT NULL DEFAULT 'vendor'`);
        await queryRunner.query(`ALTER TABLE "organisation_preference" ADD CONSTRAINT "FK_2de786f3f89e650581916d67f86" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organisation" ADD CONSTRAINT "FK_d8df3e440ba45237db29bae7631" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organisation" ADD CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df"`);
        await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_d8df3e440ba45237db29bae7631"`);
        await queryRunner.query(`ALTER TABLE "organisation_preference" DROP CONSTRAINT "FK_2de786f3f89e650581916d67f86"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_type"`);
        await queryRunner.query(`DROP TYPE "public"."user_user_type_enum"`);
        await queryRunner.query(`DROP TABLE "organisation"`);
        await queryRunner.query(`DROP TABLE "organisation_preference"`);
    }

}
