import React, { useState } from "react";

interface Values {
	title: string;
}

interface Props {
	initialValues: Values;
}

const UpdateTaskForm: React.FC<Props> = ({ initialValues }) => {
	const [values, setValues] = useState<Values>(initialValues);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues((prevValues) => ({ ...prevValues, [name]: value }));
	};
	return (
		<form>
			<p>
				<label className='field-label'>Title</label>
				<input
					type='text'
					name='title'
					className='text-input'
					value={values.title}
					onChange={handleChange}
				/>
			</p>
			<p>
				<button className='button' type='submit'>
					Save
				</button>
			</p>
		</form>
	);
};

export default UpdateTaskForm;
