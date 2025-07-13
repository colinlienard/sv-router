import type { Equal, Expect } from 'type-testing';
import type {
	AllParams,
	ConstructPathArgs,
	IsActiveArgs,
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

type test_path_0 = Expect<Equal<test_path_result_0, test_path_expected_0>>;
type test_path_result_0 = Path<TestRoutes>;
type test_path_expected_0 =
	| '/'
	| '/about'
	| '/contact/nested'
	| '/posts'
	| '/posts/static'
	| '/posts/nolayout'
	| `/posts/:id`
	| `/posts/:id/:commentId`;

type test_path_1 = Expect<Equal<test_path_result_1, test_path_expected_1>>;
type test_path_result_1 = Path<TestRoutes, true>;
type test_path_expected_1 =
	| '/'
	| '/about'
	| '/contact/nested'
	| '/posts'
	| '/posts/static'
	| '/posts/nolayout'
	| `/posts/${string}`
	| `/posts/${string}/${string}`;

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
type test_construct_path_result_2 = ConstructPathArgs<'/posts' | '/about/:id'>;
type test_construct_path_expected_2 = ['/posts'] | ['/about/:id', Record<'id', string>];

// AllParams

type test_all_params = Expect<Equal<test_all_params_result, test_all_params_expected>>;
type test_all_params_result = AllParams<TestRoutes>;
type test_all_params_expected = Partial<Record<'id' | 'commentId' | 'rest', string>>;

// IsActiveArgs

type test_is_active_args_0 = Expect<
	Equal<test_is_active_args_result_0, test_is_active_args_expected_0>
>;
type test_is_active_args_result_0 = IsActiveArgs<'/posts'>;
type test_is_active_args_expected_0 = ['/posts'];

type test_is_active_args_1 = Expect<
	Equal<test_is_active_args_result_1, test_is_active_args_expected_1>
>;
type test_is_active_args_result_1 = IsActiveArgs<'/posts/:id'>;
type test_is_active_args_expected_1 = ['/posts/:id'] | ['/posts/:id', Record<'id', string>];

type test_is_active_args_2 = Expect<
	Equal<test_is_active_args_result_2, test_is_active_args_expected_2>
>;
type test_is_active_args_result_2 = IsActiveArgs<'/posts/:id/:commentId', true>;
type test_is_active_args_expected_2 =
	| ['/posts' | '/posts/:id' | '/posts/:id/:commentId']
	| [
			'/posts' | '/posts/:id' | '/posts/:id/:commentId',
			Partial<Record<'id' | 'commentId', string>>,
	  ];
