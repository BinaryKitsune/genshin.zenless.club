import type { FC } from "react";

import dayjs from "dayjs";
import Link from "next/link";

import { charactersArray } from "@/data/characters";

export const BirthdayToday: FC = () => {
  const now = dayjs();
  const [day, month] = [now.date(), now.month() + 1];

  const celebrant = charactersArray.find((character) => {
    const [birthdayDay, birthdayMonth] = character.birthday;
    console.log(birthdayDay, birthdayMonth);
    return birthdayDay === day && birthdayMonth === month;
  });

  return (
    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg box-border border border-neutral-200 dark:border-neutral-200/10 flex flex-col">
      <h1 className="font-semibold text-xl mb-4">
        {celebrant == null && <>Characters Birthdays</>}
        {celebrant != null && <>Happy Birthday 🎉</>}
      </h1>

      {celebrant == null && <>There are no birthdays today :&#40;</>}

      {celebrant != null && (
        <>
          <div>
            <Link key={`bd-${celebrant.id}`} href={`/characters/${celebrant.id}`}>
              <a className="rounded-lg bg-neutral-100 dark:bg-neutral-900 outline outline-1 outline-neutral-200 dark:outline-neutral-200/10 flex justify-center">
                <img
                  className="rounded-lg object-center object-cover"
                  src={`/img/characters/${celebrant.id}/icon.webp`}
                  alt={`${celebrant.name} icon`}
                />
              </a>
            </Link>
          </div>

          <section className="mt-2 text-justify">
            <p>Today is a special day! It&apos;s a birthday of {celebrant.name}!</p>
            <p>
              Make sure to grab your gift and read the letter in game. See what they have prepared
              for you :&#41;
            </p>
          </section>
        </>
      )}
    </div>
  );
};