import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { Review } from "./review.entity";

@Entity("review_photos")
export class ReviewPhoto extends CustomBaseEntity {
  @Column({
    type: "text",
    nullable: false,
  })
  url: string;

  @Column({
    type: "uuid",
    nullable: false,
    name: "review_id",
  })
  reviewId!: string;

  @ManyToOne(() => Review, (review) => review.photos, {
    cascade: true,
  })
  @JoinColumn({
    name: "review_id",
  })
  review: Review;
}
