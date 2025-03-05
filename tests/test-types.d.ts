import type { Equal, Expect } from 'type-testing';
import type {
	AllParams,
	ConstructPathArgs,
	Path,
	PathParams,
	RouteComponent,
} from '../src/index.d.ts';

type TestRoutes = {
	'/': RouteComponent;
	'/about': RouteComponent;
	'/contact/nested': RouteComponent;
	'/posts': {
		'/': RouteComponent;
		'/static': RouteComponent;
		'/(nolayout)': RouteComponent;
		'/:id': {
			'/': RouteComponent;
			'/:commentId': RouteComponent;
		};
		layout: RouteComponent;
	};
	'*rest': RouteComponent;
};

// Path

type test_path = Expect<Equal<test_path_result, test_path_expected>>;
type test_path_result = Path<TestRoutes>;
type test_path_expected =
	| '/'
	| '/about'
	| '/contact/nested'
	| '/posts'
	| '/posts/static'
	| '/posts/nolayout'
	| `/posts/:id`
	| `/posts/:id/:commentId`;

// PathParams

type test_path_params_0 = Expect<Equal<test_path_params_result_0, test_path_params_expected_0>>;
type test_path_params_result_0 = PathParams<'/posts/:id/:commentId'>;
type test_path_params_expected_0 = Record<'id' | 'commentId', string>;

type test_path_params_1 = Expect<Equal<test_path_params_result_1, test_path_params_expected_1>>;
type test_path_params_result_1 = PathParams<'/posts'>;
type test_path_params_expected_1 = never;

type test_path_params_2 = Expect<Equal<test_path_params_result_2, test_path_params_expected_2>>;
type test_path_params_result_2 = PathParams<'*rest'>;
type test_path_params_expected_2 = Record<'rest', string>;

type test_path_params_3 = Expect<Equal<test_path_params_result_3, test_path_params_expected_3>>;
type test_path_params_result_3 = PathParams<'/(:id)'>;
type test_path_params_expected_3 = Record<'id', string>;

type test_path_params_4 = Expect<Equal<test_path_params_result_4, test_path_params_expected_4>>;
type test_path_params_result_4 = PathParams<'(*rest)'>;
type test_path_params_expected_4 = Record<'rest', string>;

// ConstructPathArgs

type test_construct_path_0 = Expect<
	Equal<test_construct_path_result_0, test_construct_path_expected_0>
>;
type test_construct_path_result_0 = ConstructPathArgs<'/posts/:id/:commentId'>;
type test_construct_path_expected_0 = ['/posts/:id/:commentId', Record<'id' | 'commentId', string>];

type test_construct_path_1 = Expect<
	Equal<test_construct_path_result_1, test_construct_path_expected_1>
>;
type test_construct_path_result_1 = ConstructPathArgs<'/posts'>;
type test_construct_path_expected_1 = ['/posts'];

// AllParams

type test_all_params = Expect<Equal<test_all_params_result, test_all_params_expected>>;
type test_all_params_result = AllParams<TestRoutes>;
type test_all_params_expected = Partial<Record<'id' | 'commentId' | 'rest', string>>;
