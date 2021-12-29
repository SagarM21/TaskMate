import { GetServerSideProps } from "next";
import Error from "next/error";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import CreateTaskForm from "../components/CreateTaskForm";
import TaskFilter from "../components/TaskFilter";
import TaskList from "../components/TaskList";
import {
	TasksDocument,
	TasksQuery,
	TasksQueryVariables,
	TaskStatus,
	useTasksQuery,
} from "../generated/graphql-frontend";
import { initializeApollo } from "../lib/client";
import Custom404 from "./404";

const isTaskStatus = (value: string): value is TaskStatus =>
	Object.values(TaskStatus).includes(value as TaskStatus);

export default function Home() {
	const router = useRouter();
	const status =
		Array.isArray(router.query.status) && router.query.status.length
			? router.query.status[0]
			: undefined;
	if (status !== undefined && !isTaskStatus(status)) {
		return <Custom404 />;
	}

	const prevStatus = useRef(status);
	useEffect(() => {
		prevStatus.current = status;
	}, [status]);

	const result = useTasksQuery({
		variables: { status },
		fetchPolicy:
			prevStatus.current === status ? "cache-first" : "cache-and-network",
	});
	const tasks = result.data?.tasks;

	return (
		<div>
			<Head>
				<title>Tasks</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<CreateTaskForm onSuccess={result.refetch} />
			{result.loading && !tasks ? (
				<p>Loading tasks...</p>
			) : result.error ? (
				<p>An error occured.</p>
			) : tasks && tasks.length > 0 ? (
				<TaskList tasks={tasks} />
			) : (
				<p className='no-tasks-message'>You've got no tasks.</p>
			)}
			<TaskFilter status={status} />
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const status =
		typeof context.params?.status === "string"
			? context.params.status
			: undefined;
	const apolloClient = initializeApollo();

	if (status === undefined || isTaskStatus(status)) {
		await apolloClient.query<TasksQuery, TasksQueryVariables>({
			query: TasksDocument,
			variables: { status },
		});

		return {
			props: {
				initialApolloState: apolloClient.cache.extract(),
			},
		};
	}
	return { props: {} };
};
