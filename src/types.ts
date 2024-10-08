export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface MessageItem {
  messageId: string;
  roomId: string;
  messageContent: string;
  senderId: string;
  createdAt: Date;
  mediaName: string;
  mediaType: string;
  mediaUrl: string;
}
