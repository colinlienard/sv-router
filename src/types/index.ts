import type { Component, Snippet } from 'svelte';

type BaseProps = Record<string, any>;

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

export type Path<T extends Routes> = Prettify<Unify<RecursiveKeys<StripNonRoutes<T>>>>;

type Prettify<T> = { [K in keyof T]: T[K] } & {};

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
};

type Unify<T> = {
	[K in keyof T]: T[K] extends string ? ReplaceColon<RemoveLastSlash<T[K]>> : Unify<T[K]>;
}[keyof T];

type RemoveLastSlash<T extends string> = T extends '/' ? T : T extends `${infer R}/` ? R : T;

type ReplaceColon<T extends string> = T extends `${infer R}:${string}` ? `${R}${string}` : T;
