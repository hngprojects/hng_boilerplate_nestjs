import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFullTextSearchIndexToProduct1721507728711 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE FUNCTION update_full_text_search() RETURNS trigger AS $$
          BEGIN
            NEW."fullTextSearch" := 
              to_tsvector('english', COALESCE(NEW.name, '') || ' ' || 
              COALESCE(NEW.description, '') || ' ' || 
              COALESCE(NEW.category, '') || ' ' || 
              array_to_string(NEW.tags, ' '));
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
    
          CREATE TRIGGER trg_update_full_text_search
          BEFORE INSERT OR UPDATE ON "product"
          FOR EACH ROW
          EXECUTE FUNCTION update_full_text_search();
    
          CREATE INDEX idx_products_full_text_search
          ON "product" USING gin("fullTextSearch");
        `);
      }

      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          DROP INDEX idx_products_full_text_search;
          DROP TRIGGER trg_update_full_text_search ON "product";
          DROP FUNCTION update_full_text_search;
        `);
      }

}
