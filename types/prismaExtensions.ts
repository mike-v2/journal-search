import {
  Conversation,
  Message,
  JournalEntry,
  StarredEntry,
  Post,
  User,
  Comment,
  ReadEntry,
} from '@prisma/client';

export type ConversationExt = Conversation & {
  messages: Message[];
};

export type StarredEntryExt = StarredEntry & {
  journalEntry: JournalEntry;
};

export type CommentExt = Comment & {
  user: User;
};

export type PostExt = Post & {
  journalEntry: JournalEntry;
  createdBy: User;
  comments: CommentExt[];
};

export type JournalEntryExt = JournalEntry & {
  readBy: ReadEntry[];
};