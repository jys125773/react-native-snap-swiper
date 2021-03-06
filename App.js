import React from 'react';
import { Dimensions, StyleSheet, View, StatusBar, Button, Text } from 'react-native';
import Swiper from './lib/index';

const DEVICE_WIDTH = Dimensions.get('window').width;

const imageData = [
  { id: '0', uri: '' },
  { id: '1', uri: '' },
  { id: '2', uri: '' },
  { id: '3', uri: '' },
  { id: '4', uri: '' },
  { id: '5', uri: '' },
  { id: '6', uri: '' },
  { id: '7', uri: '' },
];

export default class App extends React.Component {
  state = {
    imageData,
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar />
        <Swiper
          ref={ref => this.carousel = ref}
          onIndexChanged={index => {

          }}
          containerWidth={DEVICE_WIDTH}
          cardWidth={225}
          cardHeight={150}
          radio={0.8}
          duration={300}
          initIndex={2}
          autoplayInterval={3800}
          autoplayDirection
          autoplay={false}>
          {
            this.state.imageData.map(({ id, uri }, index) => {
              return (
                <View key={id} style={[
                  styles.item,
                  {
                    backgroundColor: `rgb(200,100,${30 * index})`,
                    height: '100%',
                    width: '100%',
                  },
                ]}>
                  <Text style={{
                    color: '#000',
                    fontSize: 40,
                  }}>{index}</Text>
                </View>
              );
            })
          }
        </Swiper>
        <View>
          <Button
            title="pre"
            onPress={() => {
              this.carousel.goPre();
            }} />
          <Button
            title="next"
            onPress={() => {
              this.carousel.goNext();
            }} />
          <Button
            title="to index 0"
            onPress={() => {
              this.carousel.animateToIndex(0);
            }} />
          <Button
            title="to index 1 without animation"
            onPress={() => {
              this.carousel.animateToIndex(1, false);
            }} />
          <Button
            title="renew children"
            onPress={() => {
              this.setState({
                imageData: this.state.imageData.length === 8 ? this.state.imageData.slice(0, 5) : imageData,
              })
            }} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  item: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
