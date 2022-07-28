import type { FC } from "react";

import dayjs from "dayjs";
import useTranslation from "next-translate/useTranslation";
import NextLink from "next/link";
import { useEffect, useState } from "react";

import { StaticPicture } from "@/components/StaticPicture";

interface Props {
  id: string;
  title: string;
  description?: string;
  publishedAtUnix?: number;
  thumbnail?: string;
  href?: string;
  className?: string;
}

export const GuideCard: FC<Props> = ({
  id,
  title,
  description,
  publishedAtUnix,
  thumbnail,
  href = "#",
  className = "",
}) => {
  const [isMounted, setMounted] = useState(false);
  const { lang } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextLink href={href} prefetch={false}>
      <a id={id} className={`card card-vertical ${className}`}>
        {thumbnail && (
          <StaticPicture
            src={thumbnail}
            className="aspect-[9/16] min-h-[10rem] w-full rounded-t-lg object-fill object-top lg:min-h-[20rem]"
            alt="character icon"
          />
        )}

        <div className="p-4">
          {publishedAtUnix && (
            <div className="text-sm font-medium text-primary-500">
              {isMounted && <>{dayjs.unix(publishedAtUnix).locale(lang).format("lll")}</>}
            </div>
          )}

          <p className="mb-2 block text-lg font-bold text-[#000] dark:text-dark-300">{title}</p>

          {description && <p className="text-justify text-sm">{description}</p>}
        </div>
      </a>
    </NextLink>
  );
};
