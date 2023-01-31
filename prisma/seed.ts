import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { charactersArray } from "./data/characters";

const prisma = new PrismaClient();

async function seed() {
  const name = "testuser";

  // cleanup the existing database
  await prisma.user.delete({ where: { name } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("1234567890", 10);

  await prisma.user.create({
    data: {
      name,
      roles: {
        create: {
          title: "DEFAULT",
        },
      },
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // charactersArray.forEach(async (character) => {
  //   await prisma.characterEntry
  //     .create({
  //       include: { meta: true },
  //       data: {
  //         accentColor: parseInt(character.accentColor.substring(1), 16),
  //         meta: {
  //           create: {
  //             create: {},
  //           },
  //         },
  //       },
  //     })
  //     .catch((e) => {
  //       if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //         console.log(`Error ${e.code} while isnerting ${character.id} data`);
  //       }
  //     });
  // });

  console.log("Database has been seeded. 🌱");
}

seed()
  .catch(async (e) => {
    await prisma.$disconnect();
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
