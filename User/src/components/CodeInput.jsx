import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const CodeInput = ({ value, onChangeText, onSubmit, disabled }) => {
	return (
		<View style={styles.wrapper}>
			<Text style={styles.label}>Enter Code</Text>
			<View style={styles.row}>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder="Type code here"
					placeholderTextColor="#8d8d8d"
					style={styles.input}
					autoCapitalize="characters"
					autoCorrect={false}
					editable={!disabled}
				/>
				<TouchableOpacity
					style={[styles.button, disabled && styles.buttonDisabled]}
					onPress={onSubmit}
					disabled={disabled}
				>
					<Text style={styles.buttonText}>Check</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		gap: 10,
	},
	label: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	row: {
		flexDirection: 'row',
		gap: 10,
	},
	input: {
		flex: 1,
		backgroundColor: '#ffffff',
		color: '#111111',
		borderRadius: 14,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
	},
	button: {
		backgroundColor: '#e74c3c',
		borderRadius: 14,
		paddingHorizontal: 18,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 96,
	},
	buttonDisabled: {
		opacity: 0.55,
	},
	buttonText: {
		color: '#ffffff',
		fontWeight: '700',
		fontSize: 15,
	},
});

export default CodeInput;
