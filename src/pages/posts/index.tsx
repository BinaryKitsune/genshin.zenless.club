import type { PostStatus, Role } from "@prisma/client";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import type { FC } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";

import { Container } from "@/components/Container";
import { Layout } from "@/components/Layout";
import { prisma } from "@/server/db/client";

/**
 *                  TODO
 *
 * - Need to add filtering for users and search field
 * - Also need to fix cards height somehow
 * - Would be nice to figure out inferece of GSSP and why
 *   it ignore NonNullable
 */

interface PostCardProps {
  status: PostStatus;
  id: string;
  slug: string;
  author: {
    id: string;
    name: string | null;
    role: Role;
  } | null;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
}

const PostCard: FC<PostCardProps> = ({ title, thumbnailUrl, description, slug }) => {
  return (
    <Link href={`/posts/${slug}`} prefetch={false}>
      <a className="card w-full p-0 lg:w-[calc(50%-1rem)]">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Post thumbnail"
            className="aspect-video w-full rounded-t-md object-cover"
          />
        )}

        <div className="p-4">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p>{description}</p>
        </div>
      </a>
    </Link>
  );
};

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
}

const Paginator: FC<PaginatorProps> = ({ currentPage, totalPages }) => {
  const router = useRouter();

  const incrementPage = async () => {
    if (currentPage >= totalPages) {
      return;
    }

    void router.push({ query: { ...router.query, page: currentPage + 1 } });
  };

  const decrementPage = () => {
    if (currentPage <= 1) {
      return;
    }

    void router.push({ query: { ...router.query, page: currentPage - 1 } });
  };

  return (
    <div className="self-ce inline-flex items-center justify-center gap-3">
      <button
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 disabled:opacity-50 dark:border-neutral-700"
        disabled={currentPage === 1}
        onClick={decrementPage}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <p className="text-sm">
        {currentPage}
        <span className="mx-0.25">/</span>
        {totalPages}
      </p>

      <button
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 disabled:opacity-50 dark:border-neutral-700"
        disabled={currentPage === totalPages}
        onClick={incrementPage}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const PostsIndex = ({ posts, currentPage, itemsPerPage, totalPosts }: PageProps) => {
  const t = useTranslations();

  const totalPages = Math.ceil((totalPosts ?? 1) / (itemsPerPage ?? 1));

  return (
    <Layout title={t("common.posts", { count: 99 })}>
      <Container className="mt-0">
        <div className="flex h-full flex-col-reverse gap-2 lg:grid lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col flex-wrap gap-2 lg:mt-4 lg:flex-row">
            {posts?.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                slug={post.slug}
                title={post.title}
                description={post.description}
                thumbnailUrl={post.thumbnailUrl}
                status={post.status}
                author={post.author}
              />
            ))}
          </div>

          <div className="sticky top-0 w-full pb-2 pt-2 lg:w-64">
            <div className="card flex flex-col bg-white/80 backdrop-blur-lg dark:bg-neutral-900/90 lg:sticky lg:top-4">
              <Paginator currentPage={currentPage ?? 1} totalPages={totalPages} />
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default PostsIndex;

export const getServerSideProps = async ({ locale = "en", query }: GetServerSidePropsContext) => {
  const page = query.page != null ? parseInt(query.page.toString()) : 1;
  if (page <= 0) {
    return {
      props: {},
      notFound: true,
    };
  }

  const itemsPerPage = 6;

  const order = query.order === "asc" ? "asc" : "desc";
  const authorName = query.author == null ? undefined : query.author.toString();
  const searchTitle =
    query.search == null
      ? undefined
      : query.search.length <= 0
      ? undefined
      : query.search.toString().trim().replaceAll(/\s+/gi, " & ");

  const skip = (page - 1) * itemsPerPage;
  const take = itemsPerPage;

  const totalPosts = await prisma.post.aggregate({
    _count: { id: true },
    where: {
      author: {
        name: authorName,
      },
      title: {
        search: searchTitle,
        mode: "insensitive",
      },
    },
  });
  const totalPages = Math.ceil(totalPosts._count.id / itemsPerPage);
  if (page > totalPages) {
    return {
      props: {},
      notFound: true,
    };
  }

  const posts = await prisma.post.findMany({
    skip,
    take,
    where: {
      author: {
        name: authorName,
      },
      title: {
        search: searchTitle,
        mode: "insensitive",
      },
    },
    orderBy: {
      publishedAt: order,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      status: true,
      author: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  const messages = {
    common: (await import(`#/locales/${locale}/common.json`)).default,
    meta: (await import(`#/locales/${locale}/meta.json`)).default,
    footer: (await import(`#/locales/${locale}/footer.json`)).default,
  };

  return {
    props: {
      messages,
      posts,
      currentPage: page,
      itemsPerPage,
      totalPosts: totalPosts._count.id,
    },
  };
};
