import { AbstractBaseEntity } from "../../../entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class EmailTemplate extends AbstractBaseEntity {
  @Column()
  name: string;
  
  @Column()
  subject: string;
  
  @Column()
  content: string;
}