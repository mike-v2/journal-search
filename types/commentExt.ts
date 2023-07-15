import { User, Comment } from "@prisma/client";

export default interface CommentExt extends Comment {
  user: User,
}