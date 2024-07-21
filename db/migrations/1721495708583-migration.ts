import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721495708583 implements MigrationInterface {
  name = 'Migration1721495708583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_name" character varying NOT NULL, "product_price" integer NOT NULL, "description" character varying NOT NULL, "user_id" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "organisation" ("org_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "org_name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_e24d73349bc604e894d2472dd0b" PRIMARY KEY ("org_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "is_active" boolean, "attempts_left" integer, "time_left" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_758b8ce7c18b9d347461b30228" UNIQUE ("user_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "bio" character varying, "phone" character varying NOT NULL, "avatar_image" character varying NOT NULL, CONSTRAINT "UQ_d80b94dc62f7467403009d88062" UNIQUE ("username"), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_organisations_organisation" ("user_id" uuid NOT NULL, "organisation_org_id" uuid NOT NULL, CONSTRAINT "PK_85ce5c695f94ed123b0bb4a25fc" PRIMARY KEY ("user_id", "organisation_org_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1cd40d4813f21edaae8bb30e2e" ON "user_organisations_organisation" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47b2ae4627bd8ef1685deb2eb3" ON "user_organisations_organisation" ("organisation_org_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_3e59a34134d840e83c2010fac9a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_758b8ce7c18b9d347461b30228d" FOREIGN KEY ("user_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" ADD CONSTRAINT "FK_1cd40d4813f21edaae8bb30e2e5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" ADD CONSTRAINT "FK_47b2ae4627bd8ef1685deb2eb33" FOREIGN KEY ("organisation_org_id") REFERENCES "organisation"("org_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" DROP CONSTRAINT "FK_47b2ae4627bd8ef1685deb2eb33"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" DROP CONSTRAINT "FK_1cd40d4813f21edaae8bb30e2e5"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_758b8ce7c18b9d347461b30228d"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_3e59a34134d840e83c2010fac9a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_47b2ae4627bd8ef1685deb2eb3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1cd40d4813f21edaae8bb30e2e"`);
    await queryRunner.query(`DROP TABLE "user_organisations_organisation"`);
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "organisation"`);
    await queryRunner.query(`DROP TABLE "product"`);
  }
}
