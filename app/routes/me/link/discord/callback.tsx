import type { LoaderArgs } from "@remix-run/node";

import { Prisma } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Container } from "~/components/Container";
import { getLinkedAccountsById, linkDiscordAccountByUserId } from "~/models/user.server";
import { exchageDiscordCode, getDiscordAccount } from "~/oauth/discord.server";
import { text } from "~/utils/responses.server";
import { ensureAuthenticatedUser } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await ensureAuthenticatedUser(request);
  const linkedAccounts = await getLinkedAccountsById(user.id);
  if (linkedAccounts.some((record) => record.provider === "discord")) {
    throw text("You have already linked your account with Discord", { status: 400 });
  }

  const url = new URL(request.url);
  const discordCode = url.searchParams.get("code");

  if (!discordCode) {
    throw text("Code was not provided", { status: 400 });
  }

  const tokenData = await exchageDiscordCode(discordCode, { type: "link" });
  const discordAccount = await getDiscordAccount(tokenData.access_token);

  try {
    await linkDiscordAccountByUserId(user.id, {
      id: discordAccount.id,
      name: discordAccount.username,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(e.code);
    } else {
      throw e;
    }
  }

  return redirect("/me");
}

export default function MeLinkDiscordCallback() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Container>
      <pre>
        <code>{JSON.stringify(loaderData, null, 2)}</code>
      </pre>
    </Container>
  );
}
