import Head from "next/head";
import Image from "next/image";
import CreateTaskForm from "../components/CreateTaskForm";
import TaskList from "../components/TaskList";
import {
	TasksDocument,
	TasksQuery,
	useTasksQuery,
} from "../generated/graphql-frontend";
import { initializeApollo } from "../lib/client";

export default function Home() {
	const result = useTasksQuery();
	const tasks = result.data?.tasks;
	return (
		<div>
			<Head>
				<title>Tasks</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<CreateTaskForm />
			{result.loading ? (
				<p>Loading tasks...</p>
			) : result.error ? (
				<p>An error occured.</p>
			) : tasks && tasks.length > 0 ? (
				<TaskList tasks={tasks} />
			) : (
				<p className='no-task-message'>You've got no tasks.</p>
			)}
		</div>
	);
}

export const getStaticProps = async () => {
	const apolloClient = initializeApollo();

	await apolloClient.query<TasksQuery>({
		query: TasksDocument,
	});

	return {
		props: {
			initialApolloState: apolloClient.cache.extract(),
		},
	};
};
