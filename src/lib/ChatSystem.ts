import { User } from "../types";

export class ChatSystem {
  private me: User;
  private clients: User[];

  constructor(me: User, clients: User[]) {
    this.me = me;
    this.clients = clients;
  }

  public getMe(): User {
    return this.me;
  }

  public getClients(): User[] {
    return this.clients;
  }
}
