## react-native-snap-swiper

React native snap swiper for ios & android.

![](https://github.com/jys125773/reactNativeSnapSwiper/blob/master/swiper.gif)

## Installation

```bash
npm install react-native-snap-swiper --save
OR
yarn add react-native-snap-swiper
```


## Overview

- [x] Scale animation
- [x] TranslateX animation 
- [x] Inifinite loop
- [x] Show buttons
- [x] Show dots
- [x] Swipe event callback
- [x] Jump to a card index 
- [x] Swipe to the previous or next card

## Props

| Props    | type   | description                                                                                             | required | default                          |
|:----------|:--------|:--------------------------------------------------|:----------------------------------|:------------|
| containerWidth | number | container width | false | Dimensions.get('window').width |
| cardWidth | number | card width | false | Dimensions.get('window').width * 0.6 |
| cardHeight | number | card height | false | Dimensions.get('window').width * 0.4 |
| radio | number | adjacent card dimension ratio | false | 0.8 |
| initIndex | number | the active card index after component mounted | false | 0 |
| animateDuration | number | the animate duration once touch release or jump to index | false | 200 |
| autoplay | bool | autoplay | false | true |
| autoplayInterval | number | autoplay interval | fasle | 3600 |
| autoplayDirection | true | autoplay direction, false equal to reverse | fasle | true |
| dotsContainerWidth | number | dots continer width | false | cardWidth * 0.66 |
| dotsContainerBottom | number | dots position bottom relative to swiper container | fasle | 10 |
| dotColor | string | dot color | false | 'rgba(0,0,0,.2)' |
| activeDotColor | string | active dot color | fasle | '#007aff'|
| dots | bool | show dots | false | true |
| showsButtons | bool | show buttons | fasle | true |
| onIndexChanged | function(index:number) | animtion end callback | fasle | ()=>{} |
| children | array | array of react-native elements,must more than 5 | true | [] |

## methods

| methods    | description |
|:----------|:------------- |
| animateToIndex(index,animated) | animate to index with animation or not |
| goNext() | aniamte to next index |
| goPre() | animate to pre index |

## Usage

```jsx
import React from 'react';
import { Dimensions, StyleSheet, View, StatusBar, Button, Text } from 'react-native';
import Swiper from 'react-native-snap-swiper';

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

```
