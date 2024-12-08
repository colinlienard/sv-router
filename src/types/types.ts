import type { Component, Snippet } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type BaseProps = {};

export type LazyRouteComponent<Props extends BaseProps = BaseProps> = () => Promise<{
	default: Component<Props>;
}>;

export type RouteComponent<Props extends BaseProps = BaseProps> =
	| Component<Props>
	| LazyRouteComponent<Props>;
export type LayoutComponent = RouteComponent<{ children: Snippet }>;

export type Routes = {
	[_: `/${string}`]: RouteComponent | Routes;
	'*'?: RouteComponent;
	layout?: LayoutComponent;
};

export type RouterMethods<T extends Routes> = {
	path<U extends Path<T>>(...args: ConstructPathArgs<U>): string;
	goto<U extends Path<T>>(...args: ConstructPathArgs<U>): void;
	params(): AllParams<T>;
};

export type Path<T extends Routes> = RemoveLastSlash<RecursiveKeys<StripNonRoutes<T>>>;

export type ConstructPathArgs<T extends string> =
	PathParams<T> extends never ? [T] : [T, PathParams<T>];

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

type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
	? Param | ExtractParams<`/${Rest}`>
	: T extends `${string}:${infer Param}`
		? Param
		: never;
