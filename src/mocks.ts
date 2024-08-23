import { faker } from "@faker-js/faker";
import { User } from "./types";

faker.seed(101);

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Team Member A",
    avatar: "/images/responders/responder_1.png",
  },
  {
    id: "2",
    name: "Team Member B",
    avatar: "/images/responders/responder_2.png",
  },
  {
    id: "3",
    name: "Team Member C",
    avatar: "/images/responders/responder_3.png",
  },
  {
    id: "4",
    name: "Team Member D",
    avatar: "/images/responders/responder_4.png",
  },
  {
    id: "5",
    name: "Team Member E",
    avatar: "/images/responders/responder_5.png",
  },
];
