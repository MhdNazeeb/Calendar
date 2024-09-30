import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.8;
const CALENDAR_HEIGHT = height * 0.5;

const PaperPeelingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nextDate, setNextDate] = useState(new Date(currentDate.getTime() + 86400000));
  const peelAnimation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: peelAnimation.x, translationY: peelAnimation.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      if (translationY > CALENDAR_HEIGHT / 3) {
        // Simulate peeling off if enough gesture distance is covered
        Animated.timing(peelAnimation, {
          toValue: { x: -CALENDAR_WIDTH / 2, y: CALENDAR_HEIGHT },
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setCurrentDate(nextDate);
          setNextDate(new Date(nextDate.getTime() + 86400000));
          peelAnimation.setValue({ x: 0, y: 0 });
        });
      } else {
        // Reset animation if gesture is not large enough
        Animated.spring(peelAnimation, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const peelStyle = {
    transform: [
      { translateX: peelAnimation.x },
      { translateY: peelAnimation.y },
      { scaleX: peelAnimation.y.interpolate({
        inputRange: [0, CALENDAR_HEIGHT],
        outputRange: [1, 0.8], // Scaling effect for more realism
      }) },
      { skewY: peelAnimation.y.interpolate({
        inputRange: [0, CALENDAR_HEIGHT],
        outputRange: ['0deg', '15deg'], // Skewing to give a curled look
      }) },
    ],
  };

  const shadowOpacity = peelAnimation.y.interpolate({
    inputRange: [0, CALENDAR_HEIGHT],
    outputRange: [0, 0.5],
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.calendar}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{nextDate.getDate()}</Text>
          <Text style={styles.monthText}>
            {nextDate.toLocaleString('default', { month: 'long' })}
          </Text>
        </View>
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={[styles.peel, peelStyle]}>
            <Animated.View style={[styles.shadow, { opacity: shadowOpacity }]} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)']}
              style={styles.gradientOverlay}
            />
            <View style={styles.peelContent}>
              <Text style={styles.dateText}>{currentDate.getDate()}</Text>
              <Text style={styles.monthText}>
                {currentDate.toLocaleString('default', { month: 'long' })}
              </Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  calendar: {
    width: CALENDAR_WIDTH,
    height: CALENDAR_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  peel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  peelContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  dateText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  monthText: {
    fontSize: 24,
    color: '#666',
    marginTop: 10,
  },
});

export default PaperPeelingCalendar;
