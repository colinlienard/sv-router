import type { Equal, Expect } from 'type-testing';
import type { Params, Path, RouteComponent } from './types.ts';

type TestRoutes = {
	'/': RouteComponent;
	'/about': RouteComponent;
	'/contact/nested': RouteComponent;
	'/posts': {
		'/': RouteComponent;
		'/static': RouteComponent;
		'/:id': {
			'/': RouteComponent;
			'/:commentId': RouteComponent;
		};
		layout: RouteComponent;
	};
	'*': RouteComponent;
};

type test_path = Expect<Equal<test_path_result, test_path_expected>>;
type test_path_result = Path<TestRoutes>;
type test_path_expected =
	| '/'
	| '/about'
	| '/contact/nested'
	| '/posts'
	| '/posts/static'
	| `/posts/${string}`
	| `/posts/${string}/${string}`;

type test_params = Expect<Equal<test_params_result, test_params_expected>>;
type test_params_result = Params<TestRoutes>;
type test_params_expected = Record<'id' | 'commentId', string>;
