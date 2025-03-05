import type { Component, Snippet } from 'svelte';
import type { Action } from 'svelte/action';

/**
 * A Svelte action that will add a class to the anchor if its `href` matches the current route. It
 * can have an optional `className` parameter to specify the class to add, otherwise it will default
 * to `is-active`.
 *
 * ```svelte
 * <a href="/about" use:isActiveLink={{ className: 'active-link' }}>
 * ```
 */
export const isActiveLink: IsActiveLink;
/**
 * Setup a new router instance with the given routes.
 *
 * ```js
 * export const { p, navigate, isActive, route } = createRouter({
 *   '/': Home,
 *   '/about': About,
 *   ...
 * });
 * ```
 */
export function createRouter<T extends Routes>(r: T): RouterApi<T>;
/** The component that will render the current route. */
export const Router: Component;
/**
 * The reactive search params of the URL. It is just a wrapper around `SvelteURLSearchParam` that
 * will update the url on change.
 */
export const searchParams: URLSearchParams;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type BaseProps = {};

export type LazyRouteComponent<Props extends BaseProps = BaseProps> = () => Promise<{
	default: Component<Props>;
}>;

export type RouteComponent<Props extends BaseProps = any> =
	| Component<Props>
	| LazyRouteComponent<Props>;
export type LayoutComponent = RouteComponent<{ children: Snippet }>;
export type Hooks = {
	/**
	 * A function that will be called before the route is loaded. If it returns a promise, the route
	 * will wait for it to resolve before loading.
	 *
	 * You can throw a `navigate` call to redirect to another route.
	 *
	 * ```js
	 * async beforeLoad() {
	 *   await ...
	 *   throw navigate('/home');
	 * }
	 * ```
	 */
	beforeLoad?(): void | Promise<void>;
	/** A function that will be called after the route is loaded. */
	afterLoad?(): void;
};

export type Routes = {
	[_: `/${string}`]: RouteComponent | Routes;
	[_: `*${string}`]: RouteComponent | undefined;
	[_: `(*${string})`]: RouteComponent | undefined;
	layout?: LayoutComponent;
	hooks?: Hooks;
};

export type IsActiveLink = Action<
	HTMLAnchorElement,
	{ className?: string; startsWith?: boolean } | undefined
>;

export type RouterApi<T extends Routes> = {
	/**
	 * Construct a path while ensuring type safety.
	 *
	 * ```js
	 * p('/users');
	 * // With parameters
	 * p('/users/:id', { id: 1 });
	 * ```
	 *
	 * @param route The route to navigate to.
	 * @param params The parameters to replace in the route.
	 */
	p<U extends Path<T>>(...args: ConstructPathArgs<U>): string;
	/**
	 * Navigate programatically to a route.
	 *
	 * ```js
	 * navigate('/users');
	 * // With parameters
	 * navigate('/users/:id', {
	 * 	params: {
	 * 		id: 1,
	 * 	},
	 * });
	 * // Back and forward
	 * navigate(-1);
	 * navigate(2);
	 * ```
	 *
	 * @param route The route to navigate to.
	 * @param options The navigation options.
	 */
	navigate<U extends Path<T>>(...args: NavigateArgs<U>): void;

	/**
	 * Will return `true` if the given path is active.
	 *
	 * Can be used with params to check the exact path, or without to check for any params in the
	 * path.
	 *
	 * @param path The route to check.
	 * @param params The optional parameters to replace in the route.
	 */
	isActive: {
		<U extends Path<T>>(...args: IsActiveArgs<U>): boolean;
		startsWith<U extends Path<T>>(...args: IsActiveArgs<U>): boolean;
	};
	route: {
		/**
		 * An object containing the parameters of the current route.
		 *
		 * For example, given the route `/posts/:slug/comments/:commentId` and the URL
		 * `http://localhost:5173/posts/hello-world/comments/123`, the `params` object would be `{ slug:
		 * 'hello-world', commentId: '123' }`.
		 */
		params: AllParams<T>;
		/** The reactive pathname of the URL. */
		pathname: string;
		/** The reactive query string part of the URL. */
		search: string;
		/** The reactive history state that can be passed to the `navigate` function. */
		state: unknown;
		/** The reactive hash part of the URL. */
		hash: string;
	};
};

export type Path<T extends Routes> = RemoveParenthesis<
	RemoveLastSlash<RecursiveKeys<StripNonRoutes<T>>>
>;

export type ConstructPathArgs<T extends string> =
	PathParams<T> extends never ? [T] : [T, PathParams<T>];

export type IsActiveArgs<T extends string> =
	PathParams<T> extends never ? [T] : [T] | [T, PathParams<T>];

export type PathParams<T extends string> =
	ExtractParams<T> extends never ? never : Record<ExtractParams<T>, string>;

export type AllParams<T extends Routes> = Partial<Record<ExtractParams<RecursiveKeys<T>>, string>>;

export type NavigateOptions =
	| {
			replace?: boolean;
			search?: string;
			state?: string;
			hash?: string;
	  }
	| undefined;

type NavigateArgs<T extends string> =
	| (PathParams<T> extends never
			? [T] | [T, NavigateOptions]
			: [T, NavigateOptions & { params: PathParams<T> }])
	| [number];

type StripNonRoutes<T extends Routes> = {
	[K in keyof T as K extends `*${string}`
		? never
		: K extends `(*${string})`
			? never
			: K extends 'layout'
				? never
				: K extends 'hooks'
					? never
					: K]: T[K] extends Routes ? StripNonRoutes<T[K]> : T[K];
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
	: T extends `${string}(:${infer Param})`
		? Param
		: T extends `${string}:${infer Param}`
			? Param
			: T extends `${string}(*${infer Param})`
				? Param
				: T extends `${string}*${infer Param}`
					? Param extends ''
						? never
						: Param
					: never;
