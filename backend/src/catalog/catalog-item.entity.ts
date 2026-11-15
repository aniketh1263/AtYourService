import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** One orderable item in the service catalog (software, hardware, access...). */
@Entity('catalog_items')
export class CatalogItem {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string; // e.g. "Laptop"

  @Column()
  category!: string; // e.g. "Hardware"

  @Column('text')
  description!: string;

  // Link to the (dummy) request portal where the employee completes the request.
  @Column()
  portalUrl!: string;
}
