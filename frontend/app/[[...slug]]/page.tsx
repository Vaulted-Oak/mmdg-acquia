import CanvasComponentTree from "@drupal-canvas/headless-next/CanvasComponentTree";
import {
  fetchPage,
  isPageRedirect,
  toNextMetadata,
} from "@drupal-canvas/headless-next";
import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { cache } from "react";
import { isPreview } from "@/lib/preview";

export const dynamic = "force-dynamic";

interface CatchAllPageProps {
  params: Promise<{ slug?: string[] }>;
}

const getPage = cache((path: string) => fetchPage(path));

async function getPath(params: CatchAllPageProps["params"]) {
  const { slug } = await params;
  return `/${(slug ?? []).map(encodeURIComponent).join("/")}`;
}

type RouteEntity = { entityType: string; bundle: string; uuid: string } | null;

/** Content types that only the member area may show. */
const MEMBER_BUNDLES = [
  "digital_content",
  "benefit",
  "member_area",
  "membership_video",
];

function isMemberContent(
  entity: RouteEntity,
): entity is NonNullable<RouteEntity> {
  return (
    entity?.entityType === "node" && MEMBER_BUNDLES.includes(entity.bundle)
  );
}

export async function generateMetadata({
  params,
}: CatchAllPageProps): Promise<Metadata> {
  const page = await getPage(await getPath(params));
  if (!page || isPageRedirect(page) || isMemberContent(page.route.entity)) {
    return {};
  }
  return toNextMetadata(page.head);
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const page = await getPage(await getPath(params));

  if (!page) {
    notFound();
  }

  // Member content is never rendered here: Source would hand this public
  // route the item's template output without any tier check. A Digital
  // Content item goes to its member page, which checks login and tier (or
  // the editor's preview). The other member types have no page of their own,
  // so an editor preview lands on the dashboard and everyone else gets a 404.
  if (!isPageRedirect(page) && isMemberContent(page.route.entity)) {
    const entity = page.route.entity;
    if (entity.bundle === "digital_content") {
      redirect(`/digital-content/${entity.uuid}`);
    }
    if (await isPreview()) {
      redirect("/member-dashboard");
    }
    notFound();
  }

  if (isPageRedirect(page)) {
    const { statusCode, url } = page.redirect;
    if (statusCode === 301 || statusCode === 308) {
      permanentRedirect(url);
    }
    redirect(url);
  }

  return <CanvasComponentTree tree={page.content} context={page.context} />;
}
