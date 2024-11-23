import type { Equal, Expect } from 'type-testing';
import type { Path, RouteComponent } from './index.ts';

type TestRoutes = {
	'/': RouteComponent;
	'/about': RouteComponent;
	'/contact/nested': RouteComponent;
	'/posts': {
		'/': RouteComponent;
		'/static': RouteComponent;
		'/:id': RouteComponent;
		layout: RouteComponent;
	};
	'*': RouteComponent;
};

type test_0 = Expect<
	Equal<
		Path<TestRoutes>,
		'/' | '/about' | '/contact/nested' | '/posts' | '/posts/static' | `/posts/${string}`
	>
>;
