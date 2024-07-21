import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductTableAndFullTextSearch1627901222340 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE product (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(255),
        tags TEXT[],
        fullTextSearch TSVECTOR
      );
    `);

    await queryRunner.query(`
      CREATE FUNCTION product_fulltext_trigger() RETURNS trigger AS $$
      begin
        new."fullTextSearch" :=
          setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(new.category, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'D');
        return new;
      end
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER product_fulltext_update BEFORE INSERT OR UPDATE
      ON product FOR EACH ROW EXECUTE FUNCTION product_fulltext_trigger();
    `);

    await queryRunner.query(`
      CREATE INDEX idx_products_full_text_search ON product USING gin(fullTextSearch);
    `);

    // Optionally, initialize existing data
    await queryRunner.query(`
      UPDATE product SET "fullTextSearch" =
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(category, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS product_fulltext_update ON product`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS product_fulltext_trigger`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_full_text_search`);
    await queryRunner.query(`ALTER TABLE product DROP COLUMN fullTextSearch`);
    await queryRunner.query(`DROP TABLE product`);
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
