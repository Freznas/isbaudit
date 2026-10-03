import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import frameDefault from '../assets/images/Character_Frame.png';
import frameCompleted from '../assets/images/Character_Frame_Completed.png';

const TrooperCard = ({ trooper, isSelected, isApproved, onPress }) => {
	return (
		<TouchableOpacity
			activeOpacity={0.9}
			style={styles.card}
			onPress={onPress}
		>
			<View style={[styles.panel, isApproved && styles.panelApproved, isSelected && styles.panelSelected]} />

			<View
				style={[
					styles.frameWrap,
					isSelected && styles.selectedFrame,
					isApproved && styles.approvedFrame,
				]}
			>
				<Image
					source={isApproved ? frameCompleted : frameDefault}
					style={styles.frameImage}
					resizeMode="stretch"
				/>
			</View>

			<View style={styles.imageWrap}>
				<Image
					source={{ uri: trooper.imageUrl }}
					style={styles.image}
					resizeMode="cover"
				/>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		flex: 1,
		position: 'relative',
		overflow: 'hidden',
 	},
	panel: {
		position: 'absolute',
		top: 8,
		left: 8,
		right: 8,
		bottom: 8,
		backgroundColor: 'rgba(16, 27, 37, 0.86)',
		borderRadius: 16,
	},
	panelSelected: {
		backgroundColor: 'rgba(18, 31, 44, 0.9)',
	},
	panelApproved: {
		backgroundColor: 'rgba(14, 35, 25, 0.78)',
	},
	frameWrap: {
		position: 'absolute',
		top: 2,
		left: 2,
		right: 2,
		bottom: 2,
		borderRadius: 16,
		overflow: 'hidden',
		zIndex: 1,
	},
	selectedFrame: {
		transform: [{ scale: 1 }],
	},
	approvedFrame: {
		opacity: 0.98,
	},
	frameImage: {
		width: '100%',
		height: '100%',
	},
	imageWrap: {
		position: 'absolute',
		top: 3,
		left: 6,
		right: 6,
		bottom: 4,
		alignItems: 'center',
		justifyContent: 'flex-end',
		zIndex: 3,
		borderRadius: 14,
		overflow: 'hidden',
	},
	image: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		bottom: 0,
	},
});

export default TrooperCard;
