export type MessageSide = 'incoming' | 'outgoing';

export type ChatMessage = {
  id: string;
  side: MessageSide;
  createdAt: string;
  text: string;
};
