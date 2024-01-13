import { Conversation, Message } from '@prisma/client';

export type ConversationExt = Conversation & {
  messages: Message[];
};
