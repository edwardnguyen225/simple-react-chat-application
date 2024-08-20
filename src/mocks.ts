import { faker } from "@faker-js/faker";
import { User } from "./types";

faker.seed(101);

export const mockUsers: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  avatar: faker.image.avatar(),
}));
