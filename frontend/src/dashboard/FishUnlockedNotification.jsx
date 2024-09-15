import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const FishUnlockedNotification = ({ onComplete }) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false);
			onComplete();
		}, 5000); // Display for 5 seconds

		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<AnimatePresence>
			{isVisible && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1000,
					}}
				>
					<Confetti
						width={window.innerWidth}
						height={window.innerHeight}
						recycle={false}
						numberOfPieces={200}
						tweenDuration={5000}
					/>
					<motion.div
						initial={{ scale: 0, rotate: 0 }}
						animate={{ scale: 1, rotate: 360 }}
						exit={{ scale: 0, rotate: 0 }}
						transition={{ duration: 1 }}
						style={{
							background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
							borderRadius: '20px',
							padding: '40px',
							boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
							textAlign: 'center',
							color: 'white',
							fontFamily: 'Arial, sans-serif',
						}}
					>
						<h2 style={{ fontSize: '24px', margin: 0 }}>New Fish Unlocked!</h2>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};

export default FishUnlockedNotification;
