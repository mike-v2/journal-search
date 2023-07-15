import { JournalEntry, Post, User, Comment } from "@prisma/client";

export default interface PostExt extends Post {
  journalEntry: JournalEntry,
  createdBy: User,
  comments: Comment[],
}