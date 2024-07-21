import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721579851707 implements MigrationInterface {
  name = 'Migration1721579851707';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "waitlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "fullName" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_973cfbedc6381485681d6a6916c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "testimonial" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_e1aee1c726db2d336480c69f7cb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "slug" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0dce9bc93c2d2c399982d04bef1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "price" double precision NOT NULL, "currentStock" integer NOT NULL DEFAULT '0', "inStock" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid, "userId" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" double precision NOT NULL DEFAULT '0', "comment" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "sms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phoneNumber" character varying NOT NULL, "message" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid NOT NULL, CONSTRAINT "PK_60793c2f16aafe0513f8817eae8" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "job_listing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "location" character varying NOT NULL, "salary" character varying NOT NULL, "jobType" character varying NOT NULL, "companyName" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_2c659754a57de984c7cd732c58f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "organisation_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "value" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "organisationId" uuid NOT NULL, CONSTRAINT "PK_3149ecbe39a50d9b76f09b9dd44" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "status" "public"."invite_status_enum" NOT NULL, "organisationId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleName" character varying NOT NULL, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "organisationId" uuid, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "organisation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "email" character varying NOT NULL, "industry" character varying NOT NULL, "type" character varying NOT NULL, "country" character varying NOT NULL, "address" text NOT NULL, "state" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "ownerId" uuid NOT NULL, "creatorId" uuid NOT NULL, CONSTRAINT "UQ_a795e00e9d60fc3c2683caac33b" UNIQUE ("email"), CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "device_id" character varying NOT NULL, "device_type" character varying NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "user_id" uuid, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "is2faEnabled" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "roleId" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "feature" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "feature" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_03930932f909ca4be8e33d16a2d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "price" integer NOT NULL, "duration" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5fde988e5d9b9a522d70ebec27c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "squeeze" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phone" character varying NOT NULL, "location" character varying NOT NULL, "jobTitle" character varying NOT NULL, "company" character varying NOT NULL, "interests" text array NOT NULL, "referralSource" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3a8521260c51931d22354bc9b41" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "notification_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "emailNotifications" boolean NOT NULL, "pushNotifications" boolean NOT NULL, "smsNotifications" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_d131abd7996c475ef768d4559ba" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "notification_id" uuid, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "regions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "regionCode" character varying NOT NULL, "regionName" character varying NOT NULL, "countryCode" character varying NOT NULL, "status" integer NOT NULL, "createdOn" TIMESTAMP NOT NULL, "createdBy" character varying NOT NULL, "modifiedOn" TIMESTAMP NOT NULL, "modifiedBy" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fcd12ed6a046276e2deb08801c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "bio" text NOT NULL, "avatarImage" character varying NOT NULL, "phone" character varying NOT NULL, "userId" uuid, CONSTRAINT "UQ_d80b94dc62f7467403009d88062" UNIQUE ("username"), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "newsletter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_036bb790d1d19efeacfd2f3740c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "help_center_topic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" text NOT NULL, "author" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_f1fd49531d0c8c8ecf09fca6e84" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "faqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" character varying NOT NULL, "answer" character varying NOT NULL, "category" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "about_us" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "introduction" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9643a00dea811eecf941ab4fdc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "custom_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sectionType" character varying NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "aboutUsId" uuid, CONSTRAINT "PK_218166a2414a8221ec593ba770a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "blog_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_32b67ddf344608b5c2fb95bc90c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "blog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid NOT NULL, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "about_us_service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "customSectionId" uuid, CONSTRAINT "PK_b175c6e7d0237c5306a95f5f0a6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "about_us_access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_560c544f1bc36e6f56e695826e7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "about_page_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "yearsInBusiness" integer NOT NULL, "customers" integer NOT NULL, "monthlyBlogReaders" integer NOT NULL, "socialFollowers" integer NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "customSectionId" uuid, CONSTRAINT "PK_45d34bf2229315280d9c32bf7da" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_organisations_organisation" ("userId" uuid NOT NULL, "organisationId" uuid NOT NULL, CONSTRAINT "PK_a94c28bfb30b248aee691608db0" PRIMARY KEY ("userId", "organisationId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_545cd87de538e925e186b2519f" ON "user_organisations_organisation" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ca218cd28f8c61f6be933a2f7" ON "user_organisations_organisation" ("organisationId") `
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plan_features_feature" ("subscriptionPlanId" uuid NOT NULL, "featureId" uuid NOT NULL, CONSTRAINT "PK_2fe57e84914a07a8efb7114fcb8" PRIMARY KEY ("subscriptionPlanId", "featureId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38ab132c04c9f000c2b2680647" ON "subscription_plan_features_feature" ("subscriptionPlanId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fca73d6b7518a653e4f3c4303a" ON "subscription_plan_features_feature" ("featureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "testimonial" ADD CONSTRAINT "FK_8455ac0da5f4cc082831516abb1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "product_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_329b8ae12068b23da547d3b4798" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_2a11d3c0ea1b2b5b1790f762b9a" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sms" ADD CONSTRAINT "FK_5e4a3ebde193729147d95e0822c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "job_listing" ADD CONSTRAINT "FK_7127aa4614511770eee77bb6538" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation_preference" ADD CONSTRAINT "FK_2de786f3f89e650581916d67f86" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_742a6b2df6fe09fad9dd2a9845b" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_91bfeec7a9574f458e5b592472d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_7312ad5dc02404626a3af795e38" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_d8df3e440ba45237db29bae7631" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notification_settings" ADD CONSTRAINT "FK_5a8ffc3b89343043c9440d631e2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ADD CONSTRAINT "FK_f2c7ecc46a58f8ec18e1b5865d7" FOREIGN KEY ("notification_id") REFERENCES "notification_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD CONSTRAINT "FK_a24972ebd73b106250713dcddd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "help_center_topic" ADD CONSTRAINT "FK_71306fc8f9a7c5fa1e4304ca012" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "custom_sections" ADD CONSTRAINT "FK_ca1377d285e2e69203fa2bef728" FOREIGN KEY ("aboutUsId") REFERENCES "about_us"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "blog" ADD CONSTRAINT "FK_2585c11fedee21900a332b554a6" FOREIGN KEY ("categoryId") REFERENCES "blog_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "about_us_service" ADD CONSTRAINT "FK_c076c5745d9b66cd8034ca2c595" FOREIGN KEY ("customSectionId") REFERENCES "custom_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "about_us_access_token" ADD CONSTRAINT "FK_efa784312477626e6176b57e99e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "about_page_stats" ADD CONSTRAINT "FK_50e4292a49f1314794b370d4399" FOREIGN KEY ("customSectionId") REFERENCES "custom_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" ADD CONSTRAINT "FK_545cd87de538e925e186b2519f5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" ADD CONSTRAINT "FK_2ca218cd28f8c61f6be933a2f71" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_features_feature" ADD CONSTRAINT "FK_38ab132c04c9f000c2b26806477" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_features_feature" ADD CONSTRAINT "FK_fca73d6b7518a653e4f3c4303a4" FOREIGN KEY ("featureId") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_features_feature" DROP CONSTRAINT "FK_fca73d6b7518a653e4f3c4303a4"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_features_feature" DROP CONSTRAINT "FK_38ab132c04c9f000c2b26806477"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" DROP CONSTRAINT "FK_2ca218cd28f8c61f6be933a2f71"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_organisations_organisation" DROP CONSTRAINT "FK_545cd87de538e925e186b2519f5"`
    );
    await queryRunner.query(`ALTER TABLE "about_page_stats" DROP CONSTRAINT "FK_50e4292a49f1314794b370d4399"`);
    await queryRunner.query(`ALTER TABLE "about_us_access_token" DROP CONSTRAINT "FK_efa784312477626e6176b57e99e"`);
    await queryRunner.query(`ALTER TABLE "about_us_service" DROP CONSTRAINT "FK_c076c5745d9b66cd8034ca2c595"`);
    await queryRunner.query(`ALTER TABLE "blog" DROP CONSTRAINT "FK_2585c11fedee21900a332b554a6"`);
    await queryRunner.query(`ALTER TABLE "custom_sections" DROP CONSTRAINT "FK_ca1377d285e2e69203fa2bef728"`);
    await queryRunner.query(`ALTER TABLE "help_center_topic" DROP CONSTRAINT "FK_71306fc8f9a7c5fa1e4304ca012"`);
    await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_a24972ebd73b106250713dcddd9"`);
    await queryRunner.query(`ALTER TABLE "settings" DROP CONSTRAINT "FK_f2c7ecc46a58f8ec18e1b5865d7"`);
    await queryRunner.query(`ALTER TABLE "notification_settings" DROP CONSTRAINT "FK_5a8ffc3b89343043c9440d631e2"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_87890d319ae77ea7ae5ec2586df"`);
    await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "FK_d8df3e440ba45237db29bae7631"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_7312ad5dc02404626a3af795e38"`);
    await queryRunner.query(`ALTER TABLE "invite" DROP CONSTRAINT "FK_91bfeec7a9574f458e5b592472d"`);
    await queryRunner.query(`ALTER TABLE "invite" DROP CONSTRAINT "FK_742a6b2df6fe09fad9dd2a9845b"`);
    await queryRunner.query(`ALTER TABLE "organisation_preference" DROP CONSTRAINT "FK_2de786f3f89e650581916d67f86"`);
    await queryRunner.query(`ALTER TABLE "job_listing" DROP CONSTRAINT "FK_7127aa4614511770eee77bb6538"`);
    await queryRunner.query(`ALTER TABLE "sms" DROP CONSTRAINT "FK_5e4a3ebde193729147d95e0822c"`);
    await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_2a11d3c0ea1b2b5b1790f762b9a"`);
    await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_1337f93918c70837d3cea105d39"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_329b8ae12068b23da547d3b4798"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`);
    await queryRunner.query(`ALTER TABLE "testimonial" DROP CONSTRAINT "FK_8455ac0da5f4cc082831516abb1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fca73d6b7518a653e4f3c4303a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_38ab132c04c9f000c2b2680647"`);
    await queryRunner.query(`DROP TABLE "subscription_plan_features_feature"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2ca218cd28f8c61f6be933a2f7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_545cd87de538e925e186b2519f"`);
    await queryRunner.query(`DROP TABLE "user_organisations_organisation"`);
    await queryRunner.query(`DROP TABLE "about_page_stats"`);
    await queryRunner.query(`DROP TABLE "about_us_access_token"`);
    await queryRunner.query(`DROP TABLE "about_us_service"`);
    await queryRunner.query(`DROP TABLE "blog"`);
    await queryRunner.query(`DROP TABLE "blog_category"`);
    await queryRunner.query(`DROP TABLE "custom_sections"`);
    await queryRunner.query(`DROP TABLE "about_us"`);
    await queryRunner.query(`DROP TABLE "faqs"`);
    await queryRunner.query(`DROP TABLE "help_center_topic"`);
    await queryRunner.query(`DROP TABLE "newsletter"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TABLE "regions"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "notification_settings"`);
    await queryRunner.query(`DROP TABLE "squeeze"`);
    await queryRunner.query(`DROP TABLE "subscription_plan"`);
    await queryRunner.query(`DROP TABLE "feature"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "organisation"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "invite"`);
    await queryRunner.query(`DROP TABLE "organisation_preference"`);
    await queryRunner.query(`DROP TABLE "job_listing"`);
    await queryRunner.query(`DROP TABLE "sms"`);
    await queryRunner.query(`DROP TABLE "review"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "product_category"`);
    await queryRunner.query(`DROP TABLE "testimonial"`);
    await queryRunner.query(`DROP TABLE "waitlist"`);
  }
}
