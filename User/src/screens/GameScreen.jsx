import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Modal,
	Animated,
	Vibration,
	Image,
	ImageBackground,
	useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TrooperCard from '../components/TrooperCard';
import { getTroopersByEventId } from '../services/eventService';
import imperialLogo from '../assets/images/BackgroundImperialLogo.png';
import row1Background from '../assets/images/BackgroundRow1.png';
import row2Background from '../assets/images/BackgroundRow2.png';
import row3Background from '../assets/images/BackgroundRow3.png';
import frameDefault from '../assets/images/Character_Frame.png';
import frameCompleted from '../assets/images/Character_Frame_Completed.png';
import frameIncorrect from '../assets/images/Character_Frame_Incorrect.png';
import numberFrame from '../assets/images/NumberFrame.png';
import buttonBorder from '../assets/icons/ButtonBorder.png';
import buttonBorderFilled from '../assets/icons/ButtonBorderFilled.png';
import returnIcon from '../assets/icons/ReturnIcon.png';

const GameScreen = ({ eventId, onBack }) => {
	const [troopers, setTroopers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedTrooperId, setSelectedTrooperId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [code, setCode] = useState('');
	const [approvedIds, setApprovedIds] = useState([]);
	const [approvedHydrated, setApprovedHydrated] = useState(false);
	const [validationType, setValidationType] = useState('');
	const [validationMessage, setValidationMessage] = useState('');

	const successScale = useRef(new Animated.Value(1)).current;
	const errorBlink = useRef(new Animated.Value(0)).current;

	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const isWideScreen = windowWidth >= 768;
	const isCompactScreen = windowWidth < 420;
	const layout = {
		headerPaddingHorizontal: isWideScreen ? 44 : 20,
		logoSize: isWideScreen ? 108 : 74,
		aurebeshLabelSize: isWideScreen ? 16 : 12,
		titleSize: isWideScreen ? 58 : 42,
		scrollPaddingHorizontal: isWideScreen ? 44 : 12,
		rowMinHeight: isWideScreen ? 172 : 126,
		rowMarkerWidth: isWideScreen ? 72 : 56,
		rowMarkerImageWidth: isWideScreen ? 64 : 48,
		cardWrapWidth: isWideScreen ? '30%' : '35.2%',
		modalMaxWidth: isWideScreen ? 760 : Math.min(windowWidth - 16, 390),
		modalMaxHeight: Math.min(windowHeight - 20, isWideScreen ? 780 : 680),
		modalPaddingHorizontal: isWideScreen ? 24 : isCompactScreen ? 12 : 16,
		modalCardWidth: isWideScreen ? '92%' : '96%',
		modalTopLogo: isWideScreen ? 72 : isCompactScreen ? 44 : 48,
		modalPortraitSize: isWideScreen ? 180 : isCompactScreen ? 118 : 128,
		modalGraphicAreaWidth: isWideScreen ? 280 : isCompactScreen ? 164 : 178,
		modalGraphicAreaHeight: isWideScreen ? 190 : isCompactScreen ? 118 : 126,
		modalNumberFrame: isWideScreen ? 150 : isCompactScreen ? 100 : 108,
		modalCodeFont: isWideScreen ? 52 : isCompactScreen ? 30 : 34,
		characterNameFont: isWideScreen ? 30 : isCompactScreen ? 19 : 21,
		modalTitleSize: isWideScreen ? 18 : isCompactScreen ? 13 : 14,
		modalTopPadding: isWideScreen ? 18 : isCompactScreen ? 10 : 12,
		modalBottomPadding: isWideScreen ? 20 : isCompactScreen ? 10 : 12,
	};

	const runErrorBlink = () => {
		errorBlink.setValue(0);
		Animated.sequence([
			Animated.timing(errorBlink, { toValue: 1, duration: 330, useNativeDriver: true }),
			Animated.timing(errorBlink, { toValue: 0, duration: 330, useNativeDriver: true }),
			Animated.timing(errorBlink, { toValue: 1, duration: 330, useNativeDriver: true }),
			Animated.timing(errorBlink, { toValue: 0, duration: 330, useNativeDriver: true }),
		]).start();
	};

	useEffect(() => {
		if (typeof window === 'undefined') {
			return undefined;
		}

		const handleKeyDown = (event) => {
			if (!isModalOpen) {
				return;
			}

			if (event.key >= '0' && event.key <= '9') {
				event.preventDefault();
				setCode((current) => `${current}${event.key}`);
				return;
			}

			if (event.key === 'Backspace') {
				event.preventDefault();
				setCode((current) => current.slice(0, -1));
				return;
			}

			if (event.key === 'Enter') {
				event.preventDefault();
				handleCheckCode();
				return;
			}

			if (event.key === 'Escape') {
				event.preventDefault();
				setIsModalOpen(false);
				setValidationType('');
				setValidationMessage('');
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isModalOpen]);

	useEffect(() => {
		let mounted = true;
		setApprovedIds([]);
		setApprovedHydrated(false);

		async function loadTroopers() {
			try {
				setLoading(true);
				const remoteTroopers = await getTroopersByEventId(eventId);

				if (!mounted) return;

				if (Array.isArray(remoteTroopers) && remoteTroopers.length > 0) {
					setTroopers(remoteTroopers);
				} else {
					setTroopers([]);
				}
			} catch (error) {
				if (!mounted) return;

				console.error('Error loading characters:', error);
				setTroopers([]);
			} finally {
				setLoading(false);
			}
		}

		loadTroopers();

		if (typeof window !== 'undefined') {
			try {
				const storageKey = `sgbountyhunt-approved-${eventId || 'default'}`;
				const storedValue = window.localStorage.getItem(storageKey);
				if (storedValue) {
					const parsedValue = JSON.parse(storedValue);
					if (Array.isArray(parsedValue)) {
						setApprovedIds(parsedValue);
					}
				}
			} catch (error) {
				console.error('Error loading approved state:', error);
			}
		}

		setApprovedHydrated(true);

		return () => {
			mounted = false;
		};
	}, [eventId]);

	useEffect(() => {
		if (!approvedHydrated || typeof window === 'undefined') {
			return;
		}

		try {
			const storageKey = `sgbountyhunt-approved-${eventId || 'default'}`;
			window.localStorage.setItem(storageKey, JSON.stringify(approvedIds));
		} catch (error) {
			console.error('Error saving approved state:', error);
		}
	}, [approvedIds, approvedHydrated, eventId]);

	const selectedTrooper = useMemo(
		() => troopers.find((trooper) => trooper.id === selectedTrooperId) || null,
		[troopers, selectedTrooperId]
	);

	const displayedTroopers = useMemo(() => troopers.slice(0, 9), [troopers]);
	const trooperRows = useMemo(
		() => [displayedTroopers.slice(0, 3), displayedTroopers.slice(3, 6), displayedTroopers.slice(6, 9)],
		[displayedTroopers]
	);
	const rowBackgrounds = [row1Background, row2Background, row3Background];
	const isSelectedTrooperApproved = Boolean(
		selectedTrooper && approvedIds.includes(selectedTrooper.id)
	);
	const modalFrameSource = isSelectedTrooperApproved || validationType === 'success' ? frameCompleted : frameDefault;
	const approvedDisplayedCount = useMemo(
		() => approvedIds.filter((id) => displayedTroopers.some((trooper) => trooper.id === id)).length,
		[approvedIds, displayedTroopers]
	);

	const handleTrooperPress = (trooper) => {
		setSelectedTrooperId(trooper.id);
		setCode('');
		setValidationType('');
		setValidationMessage('');
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedTrooperId(null);
		setCode('');
		setValidationType('');
		setValidationMessage('');
	};

	const handleCodeDigitPress = (digit) => {
		setCode((current) => {
			const nextValue = `${current}${digit}`.replace(/\D/g, '').slice(0, 2);
			return nextValue;
		});
	};

	const handleCodeBackspace = () => {
		setCode((current) => current.slice(0, -1));
	};

	const handleCodeClear = () => {
		setCode('');
	};

	const digitsOnly = (value) => String(value || '').replace(/\D/g, '');
	const displayCode = useMemo(() => {
		if (!code) {
			return '00';
		}

		if (code.length === 1) {
			return `0${code}`;
		}

		return code.slice(0, 2);
	}, [code]);

	const runSuccessFeedback = () => {
		Animated.sequence([
			Animated.spring(successScale, {
				toValue: 1.05,
				friction: 4,
				tension: 110,
				useNativeDriver: true,
			}),
			Animated.spring(successScale, {
				toValue: 1,
				friction: 5,
				tension: 120,
				useNativeDriver: true,
			}),
		]).start();
	};

	const handleCheckCode = () => {
		if (!selectedTrooper) return;
		const typedCode = digitsOnly(code);
		const expectedCode = digitsOnly(selectedTrooper.eventNumber || selectedTrooper.trooperId);

		if (!typedCode) return;

		if (expectedCode) {
			const typedNum = Number(typedCode);
			const expectedNum = Number(expectedCode);
			const numericComparePossible = !Number.isNaN(typedNum) && !Number.isNaN(expectedNum);

			if (numericComparePossible) {
				if (typedNum !== expectedNum) {
					setValidationType('error');
					setValidationMessage('');
					Vibration.vibrate(200);
					runErrorBlink();
					return;
				}
			} else {
				if (typedCode !== expectedCode) {
					setValidationType('error');
					setValidationMessage('');
					Vibration.vibrate(200);
					runErrorBlink();
					return;
				}
			}
		}

		setApprovedIds((current) =>
			current.includes(selectedTrooper.id) ? current : [...current, selectedTrooper.id]
		);
		setValidationType('success');
		setValidationMessage('');
		Vibration.vibrate([0, 60, 35, 60]);
		runSuccessFeedback();
		// stay in the input modal on success; approve button will be hidden
	};

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<TouchableOpacity style={styles.backButton} onPress={onBack}>
				<Image source={returnIcon} style={styles.backButtonIcon} resizeMode="contain" />
				<Text style={styles.backButtonText}>Back</Text>
			</TouchableOpacity>
			<View
				style={[
					styles.screenScaleWrap,
					{ width: '100%', minHeight: windowHeight },
				]}
			>
				<View style={[styles.header, { paddingHorizontal: layout.headerPaddingHorizontal }]}>
					<View style={styles.headerTextWrap}>
						<Image source={imperialLogo} style={[styles.logo, { width: layout.logoSize, height: layout.logoSize }]} resizeMode="contain" />
						<Text style={[styles.aurebeshLabel, { fontSize: layout.aurebeshLabelSize }]}>isb audit</Text>
						<Text style={[styles.title, { fontSize: layout.titleSize }]}>ISB AUDIT</Text>
					</View>
				</View>

				<ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: layout.scrollPaddingHorizontal }]} showsVerticalScrollIndicator={false}>
					<View style={styles.rowsWrap}>
						{trooperRows.map((rowTroopers, rowIndex) => (
							<View
								key={`row-${rowIndex}`}
								style={[
									styles.rowScene,
									{ minHeight: layout.rowMinHeight, paddingLeft: isWideScreen ? 28 : 20 },
									rowIndex > 0 && styles.rowSceneTight,
								]}
							>
								<View style={[styles.rowMarkerWrap, { width: layout.rowMarkerWidth, left: isWideScreen ? -28 : -20 }]}>
									<Image
										source={rowBackgrounds[rowIndex] || row3Background}
										style={[styles.rowMarkerImage, { width: layout.rowMarkerImageWidth, height: isWideScreen ? 188 : 144 }]}
										resizeMode="contain"
									/>
								</View>

								<View style={styles.grid}>
									{rowTroopers.map((trooper, cardIndex) => (
										<View
											key={trooper.id}
											style={[styles.cardWrap, { width: layout.cardWrapWidth }, cardIndex > 0 && styles.cardWrapShiftLeft]}
										>
											<TrooperCard
												trooper={trooper}
												isSelected={trooper.id === selectedTrooperId}
												isApproved={approvedIds.includes(trooper.id)}
												onPress={() => handleTrooperPress(trooper)}
											/>
										</View>
									))}
								</View>
							</View>
						))}
					</View>
				</ScrollView>

				<Modal
					transparent
					visible={isModalOpen}
					animationType="fade"
					onRequestClose={() => {
						closeModal();
					}}
				>
					<View style={styles.modalBackdrop}>
						<Animated.View
							style={[
								styles.modalCard,
								{
									maxWidth: layout.modalMaxWidth,
									maxHeight: layout.modalMaxHeight,
									width: layout.modalCardWidth,
									paddingHorizontal: layout.modalPaddingHorizontal,
									paddingTop: layout.modalTopPadding,
									paddingBottom: layout.modalBottomPadding,
								},
								validationType === 'error' && styles.modalCardError,
								validationType === 'success' && styles.modalCardSuccess,
								{ transform: [{ scale: successScale }] },
							]}
						>
						<ScrollView
							style={styles.modalContentScroll}
							contentContainerStyle={styles.modalContentScrollContent}
							showsVerticalScrollIndicator={false}
							bounces={false}
						>
						<View style={styles.modalTopSection}>
								<Image source={imperialLogo} style={[styles.modalTopLogo, { width: layout.modalTopLogo, height: layout.modalTopLogo }]} resizeMode="contain" />
							<Text style={styles.modalTopLabel}>ISB AUDIT</Text>
						</View>

						<View style={styles.modalDivider} />

						<View style={styles.modalCharacterSection}>
							<View style={[styles.modalPortraitWrap, { width: layout.modalPortraitSize, height: layout.modalPortraitSize }]}>
								{selectedTrooper?.imageUrl ? (
									<Image
										source={{ uri: selectedTrooper.imageUrl }}
										style={styles.modalPortrait}
										resizeMode="cover"
									/>
								) : (
									<View style={styles.modalPortraitPlaceholder} />
								)}
								<Image source={modalFrameSource} style={styles.modalPortraitFrame} resizeMode="stretch" />
								{validationType === 'error' ? (
									<Animated.Image
										source={frameIncorrect}
										style={[styles.modalPortraitFrame, { opacity: errorBlink }]}
										resizeMode="stretch"
									/>
								) : null}
							</View>
							<Text
								style={[styles.modalCharacterNameAurebesh, { fontSize: layout.characterNameFont * 0.45 }]}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{selectedTrooper?.name || 'UNKNOWN TROOPER'}
							</Text>
							<Text
								style={[styles.modalCharacterName, { fontSize: layout.characterNameFont, lineHeight: layout.characterNameFont + 4 }]}
								numberOfLines={1}
								ellipsizeMode="tail"
								adjustsFontSizeToFit
								minimumFontScale={0.62}
							>
								{selectedTrooper?.name || 'UNKNOWN TROOPER'}
							</Text>
						</View>

						{!isSelectedTrooperApproved ? (
							<View style={styles.modalInputSection}>
								<Text style={[styles.modalTitle, { fontSize: layout.modalTitleSize }]}>INPUT NUMBER BELOW</Text>
								<View
									style={[
										styles.modalGraphicArea,
										{ width: layout.modalGraphicAreaWidth, height: layout.modalGraphicAreaHeight },
									]}
								>
									<View style={styles.modalCodeOverlay} pointerEvents="none">
										<Image source={numberFrame} style={[styles.modalNumberFrame, { width: layout.modalNumberFrame, height: layout.modalNumberFrame }]} resizeMode="contain" />
										<View style={styles.modalNumberOverlay} pointerEvents="none">
											<Text style={[styles.modalCodeTextCentered, { fontSize: layout.modalCodeFont }]}>{displayCode}</Text>
										</View>
									</View>
								</View>
								<View style={styles.modalKeypad}>
									{[
										['1', '2', '3'],
										['4', '5', '6'],
										['7', '8', '9'],
									].map((row) => (
										<View key={row.join('-')} style={styles.modalKeypadRow}>
											{row.map((digit) => (
												<TouchableOpacity
													key={digit}
													style={styles.modalKeyButton}
													onPress={() => {
														if (code.length < 2) {
															handleCodeDigitPress(digit);
														}
													}}
												>
													<Text style={styles.modalKeyButtonText}>{digit}</Text>
												</TouchableOpacity>
											))}
										</View>
									))}
									<View style={styles.modalKeypadRow}>
										<TouchableOpacity style={styles.modalKeyButtonSecondary} onPress={handleCodeClear}>
											<Text style={styles.modalKeyButtonSecondaryText}>Clear</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={styles.modalKeyButton}
											onPress={() => {
												if (code.length < 2) {
													handleCodeDigitPress('0');
												}
											}}
										>
											<Text style={styles.modalKeyButtonText}>0</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.modalKeyButtonSecondary} onPress={handleCodeBackspace}>
											<Text style={styles.modalKeyButtonSecondaryText}>⌫</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						) : null}

						{validationMessage ? (
							<Text
								style={[
									styles.validationText,
									validationType === 'error' && styles.validationTextError,
								]}
							>
								{validationMessage}
							</Text>
						) : null}
						</ScrollView>

						<View style={styles.modalActionsSection}>
							<View style={styles.modalDivider} />
							<View style={styles.modalActions}>
								<TouchableOpacity
									style={styles.modalImageButtonPressable}
									onPress={() => {
										closeModal();
									}}
								>
									<ImageBackground source={buttonBorder} style={styles.modalImageButton} resizeMode="contain">
										<Text style={styles.modalImageButtonText}>Return To Audit</Text>
									</ImageBackground>
								</TouchableOpacity>
								{!isSelectedTrooperApproved && validationType !== 'success' && (
									<TouchableOpacity
										style={styles.modalImageButtonPressable}
										onPress={handleCheckCode}
										disabled={!code.trim()}
									>
										<ImageBackground source={buttonBorderFilled} style={styles.modalImageButton} resizeMode="contain">
											<Text style={[styles.modalImageButtonText, { color: '#000000' }]}>Verify</Text>
										</ImageBackground>
									</TouchableOpacity>
								)}
							</View>
						</View>
						</Animated.View>
					</View>
				</Modal>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
		paddingTop: 24,
	},
	screenScaleWrap: {
		flex: 1,
		alignSelf: 'center',
		transformOrigin: 'top center',
	},
	header: {
		justifyContent: 'center',
		paddingHorizontal: 20,
		marginBottom: 8,
		paddingTop: 23,
	},
	backButton: {
		position: 'absolute',
		bottom: 10,
		left: 12,
		height: 92,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 2,
		justifyContent: 'center',
		zIndex: 10,
	},
	backButtonIcon: {
		width: 50,
		height: 40,
	},
	backButtonText: {
		marginLeft: 1,
		paddingTop:4,
		color: '#f2f9ff',
		fontSize: 12,
		fontFamily: 'Outfit-ExtraLight',
		lineHeight: 12,
		includeFontPadding: false,
		textAlignVertical: 'center',
	},
	headerTextWrap: {
		alignItems: 'center',
		paddingTop: 9,
	},
	logo: {
		width: 74,
		height: 74,
		marginBottom: 11,
	},
	aurebeshLabel: {
		color: '#d8f1ff',
		fontSize: 12,
		letterSpacing: 2,
		fontFamily: 'Aurebesh',
		marginBottom: 6,
	},
	title: {
		color: '#f2f9ff',
		fontSize: 42,
		fontFamily: 'Waukegan LDO Black',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	info: {
		color: '#ffd166',
		paddingHorizontal: 20,
		marginBottom: 8,
		textAlign: 'center',
		fontFamily: 'Waukegan LDO Black',
	},
	loading: {
		color: '#a6c0d6',
		paddingHorizontal: 20,
		marginBottom: 8,
		textAlign: 'center',
		fontFamily: 'Waukegan LDO Black',
	},
	scrollContent: {
		paddingHorizontal: 12,
		paddingBottom: 34,
	},
	rowsWrap: {
		gap: 0,
	},
	rowScene: {
		minHeight: 126,
		justifyContent: 'center',
		paddingLeft: 20,
		paddingRight: 0,
	},
	rowSceneTight: {
		marginTop: -14,
	},
	rowMarkerWrap: {
		position: 'absolute',
		left: -20,
		top: 0,
		bottom: 0,
		width: 56,
		alignItems: 'center',
		justifyContent: 'center',
	},
	rowMarkerImage: {
		width: 48,
		height: 144,
		opacity: 0.92,
	},
	grid: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	cardWrap: {
		width: '35.2%',
		aspectRatio: 1,
	},
	cardWrapShiftLeft: {
		marginLeft: -10,
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.56)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 10,
	},
	modalCard: {
		backgroundColor: 'rgba(8, 16, 24, 0.95)',
		borderRadius: 18,
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 8,
		gap: 6,
		borderWidth: 1,
		borderColor: 'rgba(180, 220, 245, 0.35)',
		width: '100%',
			maxWidth: 390,
		maxHeight: '92%',
		overflow: 'hidden',
		flexShrink: 1,
	},
	modalContentScroll: {
		width: '100%',
		flexGrow: 1,
	},
	modalContentScrollContent: {
		alignItems: 'center',
		paddingBottom: 2,
	},
	modalCardError: {
		opacity: 1,
	},
	modalCardSuccess: {
		opacity: 1,
	},
	modalTopSection: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 0,
		paddingBottom: 4,
	},
	modalTopLogo: {
		width: 42,
		height: 42,
		marginBottom: 4,
	},
	modalTopLabel: {
		color: '#d7edff',
		fontSize: 9,
		letterSpacing: 2.2,
		fontFamily: 'Outfit-ExtraLight',
	},
	modalDivider: {
		height: 1,
		backgroundColor: 'rgba(197, 238, 255, 0.5)',
		marginVertical: 3,
	},
	modalCharacterSection: {
		alignItems: 'center',
		paddingTop: 2,
		paddingBottom: 2,
	},
	modalPortraitWrap: {
		width: 108,
		height: 108,
		borderRadius: 18,
		overflow: 'hidden',
		backgroundColor: 'transparent',
		position: 'relative',
	},
	modalPortrait: {
		position: 'absolute',
		top: 1,
		left: 4,
		right: 4,
		bottom: 2,
		zIndex: 2,
	},
	modalPortraitFrame: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		zIndex: 1,
	},
	modalPortraitPlaceholder: {
		flex: 1,
		backgroundColor: '#000000',
	},
	modalCharacterName: {
		marginTop: 6,
		color: '#f1f8ff',
		fontSize: 18,
		lineHeight: 22,
		textAlign: 'center',
		fontFamily: 'Waukegan LDO Black',
		letterSpacing: 0.4,
		textTransform: 'uppercase',
		width: '100%',
		maxWidth: 440,
		paddingHorizontal: 8,
		flexShrink: 1,
		overflow: 'hidden',
		alignSelf: 'center',
	},
	modalCharacterNameAurebesh: {
		marginTop: 4,
		color: '#cfeeff',
		fontSize: 8,
		letterSpacing: 1.8,
		textAlign: 'center',
		fontFamily: 'Aurebesh',
		textTransform: 'lowercase',
		width: '100%',
		maxWidth: 440,
		paddingHorizontal: 8,
		flexShrink: 1,
		overflow: 'hidden',
		alignSelf: 'center',
	},
	modalInputSection: {
		alignItems: 'center',
		paddingTop: 0,
		paddingBottom: 0,
	},
	modalKeypad: {
		width: '100%',
		alignItems: 'center',
		marginTop: 2,
		gap: 3,
	},
	modalTitle: {
		fontSize: 12,
		fontWeight: '500',
		color: '#dfe8f0',
		letterSpacing: 1.3,
		textAlign: 'center',
		marginBottom: 6,
		fontFamily: 'Outfit-ExtraLight',
	},
	modalGraphicArea: {
		width: 152,
		height: 108,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	modalCodeOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalNumberFrame: {
		width: 92,
		height: 92,
		zIndex: 1,
	},
	modalNumberOverlay: {
		position: 'absolute',
		left: 4,
		top: 5,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 3,
	},
	modalCodeTextCentered: {
		color: '#f4f8ff',
		fontSize: 28,
		lineHeight: 30,
		fontFamily: 'Aurebesh',
		letterSpacing: 0.6,
		textAlign: 'center',
		width: '100%',
		marginTop: 0,
		includeFontPadding: false,
		textAlignVertical: 'center',
	},
	validationText: {
		fontSize: 11,
		fontWeight: '700',
		fontFamily: 'Outfit-ExtraLight',
		textAlign: 'center',
	},
	validationTextError: {
		color: '#c92a2a',
	},
	validationTextSuccess: {
		color: '#2b8a3e',
	},
	modalActionsSection: {
		marginTop: -2,
		width: '100%',
		flexShrink: 0,
	},
	modalKeypadRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 6,
		width: '100%',
	},
	modalKeyButton: {
		width: 42,
		height: 42,
		borderRadius: 14,
		backgroundColor: 'rgba(233, 243, 252, 0.12)',
		borderWidth: 1,
		borderColor: 'rgba(197, 238, 255, 0.35)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalKeyButtonText: {
		color: '#f4f8ff',
		fontSize: 15,
		fontFamily: 'Waukegan LDO Black',
	},
	modalKeyButtonSecondary: {
		minWidth: 62,
		height: 42,
		paddingHorizontal: 8,
		borderRadius: 14,
		backgroundColor: 'rgba(233, 243, 252, 0.08)',
		borderWidth: 1,
		borderColor: 'rgba(197, 238, 255, 0.25)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalKeyButtonSecondaryText: {
		color: '#dfe8f0',
		fontSize: 10,
		fontFamily: 'Outfit-ExtraLight',
		fontWeight: '700',
	},
	modalActions: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10,
		marginTop: 2,
		width: '100%',
	},
	modalImageButtonPressable: {
		minWidth: 110,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalImageButton: {
		width: 128,
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalImageButtonText: {
		color: '#f4f8ff',
		fontSize: 11,
		letterSpacing: 0.8,
		fontFamily: 'Outfit-ExtraLight',
		fontWeight: '700',
		textAlign: 'center',
		textTransform: 'uppercase',
	},
	modalCodeText: {
		position: 'absolute',
		top: 21,
		left: 42,
		width: 104,
		height: 86,
		color: '#f4f8ff',
		fontSize: 38,
		fontFamily: 'Aurebesh',
		letterSpacing: 2,
		textAlign: 'center',
		textAlignVertical: 'center',
		includeFontPadding: false,
		zIndex: 3,
	},
});

export default GameScreen;
