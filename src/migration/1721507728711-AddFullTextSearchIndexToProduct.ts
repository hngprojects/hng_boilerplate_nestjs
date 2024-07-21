import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullTextSearchIndexToProduct implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION to_tsvector_combined_immutable(
          name text,
          description text,
          category text,
          tags text[]
      )
      RETURNS tsvector AS $$
      BEGIN
          RETURN 
              to_tsvector('english', name) ||
              to_tsvector('english', description) ||
              to_tsvector('english', category) ||
              to_tsvector('english', array_to_string(tags, ' '));
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE INDEX idx_products_full_text_search
      ON products
      USING gin(
          to_tsvector_combined_immutable(name, description, category, tags)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_full_text_search;
      DROP FUNCTION IF EXISTS to_tsvector_combined_immutable(name text, description text, category text, tags text[]);
    `);
  }
}




// import { MigrationInterface, QueryRunner } from "typeorm";

// export class AddFullTextSearchIndexToProduct1721507728711 implements MigrationInterface {

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`
//           CREATE FUNCTION update_full_text_search() RETURNS trigger AS $$
//           BEGIN
//             NEW."fullTextSearch" := 
//               to_tsvector('english', COALESCE(NEW.name, '') || ' ' || 
//               COALESCE(NEW.description, '') || ' ' || 
//               COALESCE(NEW.category, '') || ' ' || 
//               array_to_string(NEW.tags, ' '));
//             RETURN NEW;
//           END;
//           $$ LANGUAGE plpgsql;
    
//           CREATE TRIGGER trg_update_full_text_search
//           BEFORE INSERT OR UPDATE ON "product"
//           FOR EACH ROW
//           EXECUTE FUNCTION update_full_text_search();
    
//           CREATE INDEX idx_products_full_text_search
//           ON "product" USING gin("fullTextSearch");
//         `);
//       }

//       public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`
//           DROP INDEX idx_products_full_text_search;
//           DROP TRIGGER trg_update_full_text_search ON "product";
//           DROP FUNCTION update_full_text_search;
//         `);
//       }

// }
