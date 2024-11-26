import type { Equal, Expect } from 'type-testing';
import type { AllParams, Path, PathParams, RouteComponent } from './types.ts';

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
	| `/posts/:id`
	| `/posts/:id/:commentId`;

type test_path_params_0 = Expect<Equal<test_path_params_result_0, test_path_params_expected_0>>;
type test_path_params_result_0 = PathParams<'/posts/:id/:commentId'>;
type test_path_params_expected_0 = Record<'id' | 'commentId', string>;

type test_path_params_1 = Expect<Equal<test_path_params_result_1, test_path_params_expected_1>>;
type test_path_params_result_1 = PathParams<'/posts'>;
type test_path_params_expected_1 = never;

type test_params = Expect<Equal<test_params_result, test_params_expected>>;
type test_params_result = AllParams<TestRoutes>;
type test_params_expected = Partial<Record<'id' | 'commentId', string>>;
