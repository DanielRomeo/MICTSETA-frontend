// app/components/Alert.tsx
import { useEffect } from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';

interface AlertProps {
	variant: 'success' | 'danger' | 'info' | 'warning';
	message: string;
	onClose?: () => void;
	dismissible?: boolean;
	autoDismiss?: number; // ms to auto-dismiss
}

const Alert = ({ variant, message, onClose, dismissible = true, autoDismiss }: AlertProps) => {
	useEffect(() => {
		if (autoDismiss) {
			const timer = setTimeout(() => {
				if (onClose) onClose();
			}, autoDismiss);
			return () => clearTimeout(timer);
		}
	}, [autoDismiss, onClose]);

	return (
		<BootstrapAlert variant={variant} onClose={onClose} dismissible={dismissible}>
			{message}
		</BootstrapAlert>
	);
};

export default Alert;
