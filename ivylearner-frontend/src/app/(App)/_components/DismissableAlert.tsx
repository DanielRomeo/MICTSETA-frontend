'use client';
import React, { useState } from 'react';
import { Alert, Button, Col, Row, Container } from 'react-bootstrap';
import styles from './_styles/dismissableAlert.module.scss';

type alertType = 'success' | 'error';

export type alertProps = {
	type: string;
	heading?: string;
	message?: string | null;
};

const AlertDismissible = (props: alertProps) => {
	const [show, setShow] = useState(true);

	return (
		<div>
			<Alert
				variant="warning"
				className={` ${styles.alert} ${props.type === 'success' ? styles.success : styles.error}`}
				onClose={() => setShow(false)}
				dismissible
			>
				<Alert.Heading>
					{' '}
					{props.heading ? <div>{props.heading}</div> : <div></div>}{' '}
				</Alert.Heading>

				<p>
					{props.message ? (
						<>{props.message}</>
					) : (
						<>{props.type === 'error' ? <>There was an error!</> : <>Successful.</>}</>
					)}
				</p>
			</Alert>
		</div>
	);
};

export default AlertDismissible;
