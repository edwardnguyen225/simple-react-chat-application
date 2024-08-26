export interface MessageItem {
  messageId: string;
  roomId: string;
  messageContent: string;
  senderId: string;
  createdAt: Date;
  mediaType: string;
  mediaUrl: string;
}
