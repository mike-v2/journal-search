import {
  Conversation,
  Message,
  JournalEntry,
  StarredEntry,
  Post,
  User,
  Comment,
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
