import type { Component, Snippet } from 'svelte';

/**
 * Setup a new router instance with the given routes.
 *
 * ```js
 * export const { path, navigate, params } = createRouter({
 *   '/': Home,
 *   '/about': About,
 *   ...
 * });
 * ```
 */
export function createRouter<T extends Routes>(r: T): RouterApi<T>;
export const Router: Component;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type BaseProps = {};

export type LazyRouteComponent<Props extends BaseProps = BaseProps> = () => Promise<{
	default: Component<Props>;
}>;

export type RouteComponent<Props extends BaseProps = any> =
	| Component<Props>
	| LazyRouteComponent<Props>;
export type LayoutComponent = RouteComponent<{ children: Snippet }>;

export type Routes = {
	[_: `/${string}`]: RouteComponent | Routes;
	'*'?: RouteComponent;
	layout?: LayoutComponent;
};

export type RouterApi<T extends Routes> = {
	p<U extends Path<T>>(...args: ConstructPathArgs<U>): string;
	navigate<U extends Path<T>>(...args: NavigateArgs<U>): void;
	router: {
		params: AllParams<T>;
		pathname: string;
		search: string;
		state: unknown;
		hash: string;
	};
};

export type Path<T extends Routes> = RemoveParenthesis<
	RemoveLastSlash<RecursiveKeys<StripNonRoutes<T>>>
>;

export type ConstructPathArgs<T extends string> =
	PathParams<T> extends never ? [T] : [T, PathParams<T>];

export type NavigateOptions =
	| {
			replace?: boolean;
			search?: string;
			state?: string;
			hash?: `#${string}`;
	  }
	| undefined;

export type NavigateArgs<T extends string> =
	PathParams<T> extends never
		? [T, NavigateOptions]
		: [T, NavigateOptions & { params: PathParams<T> }];

export type PathParams<T extends string> =
	ExtractParams<T> extends never ? never : Record<ExtractParams<T>, string>;

export type AllParams<T extends Routes> = Partial<Record<ExtractParams<RecursiveKeys<T>>, string>>;

type StripNonRoutes<T extends Routes> = {
	[K in keyof T as K extends '*' ? never : K extends 'layout' ? never : K]: T[K] extends Routes
		? StripNonRoutes<T[K]>
		: T[K];
};

type RecursiveKeys<T extends Routes, Prefix extends string = ''> = {
	[K in keyof T]: K extends string
		? T[K] extends Routes
			? RecursiveKeys<T[K], `${Prefix}${K}`>
			: `${Prefix}${K}`
		: never;
}[keyof T];

type RemoveLastSlash<T extends string> = T extends '/' ? T : T extends `${infer R}/` ? R : T;

type RemoveParenthesis<T extends string> = T extends `${infer A}(${infer B})${infer C}`
	? RemoveParenthesis<`${A}${B}${C}`>
	: T;

type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
	? Param | ExtractParams<`/${Rest}`>
	: T extends `${string}:${infer Param}`
		? Param
		: never;
