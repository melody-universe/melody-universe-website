import type { ComponentType } from "react";
import type { createRoutesStub } from "react-router";
import type {
  CreateComponentProps,
  CreateErrorBoundaryProps,
  CreateHydrateFallbackProps,
  CreateMetaArgs,
  CreateServerActionArgs,
  CreateServerLoaderArgs,
  MetaDescriptors,
} from "react-router/route-module";

type ActionData<TRouteInfo> = TRouteInfo extends {
  actionData: infer TActionData;
}
  ? TActionData
  : never;

type LoaderData<TRouteInfo> = TRouteInfo extends {
  loaderData: infer TLoaderData;
}
  ? TLoaderData
  : never;

// any is required to extract the inferred RouteInfo type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteInfo = any extends CreateComponentProps<infer R> ? R : never;
type StubRouteObject = Parameters<typeof createRoutesStub>[0][number];

type TypedStubRouteObject<TRouteInfo extends RouteInfo> = Omit<
  StubRouteObject,
  | "action"
  | "Component"
  | "ErrorBoundary"
  | "HydrateFallback"
  | "loader"
  | "meta"
> & {
  action?: (
    arg: CreateServerActionArgs<TRouteInfo>,
    handlerCtx?: unknown,
  ) => ActionData<TRouteInfo> | Promise<ActionData<TRouteInfo>>;
  Component?: ComponentType<CreateComponentProps<TRouteInfo>>;
  ErrorBoundary?: ComponentType<CreateErrorBoundaryProps<TRouteInfo>>;
  HydrateFallback?: ComponentType<CreateHydrateFallbackProps<TRouteInfo>>;
  loader?: {
    (
      args: CreateServerLoaderArgs<TRouteInfo>,
      handlerCtx?: unknown,
    ): LoaderData<TRouteInfo> | Promise<LoaderData<TRouteInfo>>;
    hydrate?: boolean;
  };
  meta?: (args: CreateMetaArgs<TRouteInfo>) => MetaDescriptors;
};

export function createRouteStub<TRouteInfo extends RouteInfo>(
  stub: TypedStubRouteObject<TRouteInfo>,
): StubRouteObject {
  return stub as StubRouteObject;
}
