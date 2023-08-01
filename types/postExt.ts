import { JournalEntry, Post, User } from "@prisma/client";
import CommentExt from "./commentExt";

export default interface PostExt extends Post {
  journalEntry: JournalEntry,
  createdBy: User,
  comments: CommentExt[],
}