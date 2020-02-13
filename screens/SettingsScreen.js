import React from 'react';
import { View, StyleSheet, Alert, Clipboard, ToastAndroid, Text, Platform, AsyncStorage } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import Constants from 'expo-constants';

// export default function LogoutScreen() {
  export default class LogoutScreen extends React.Component {
  

  showAlert(){
    Alert.alert('Logout', 'Are you sure?', 
        [{ text: 'OK', onPress: () => {  
          global.cookies = ''
          AsyncStorage.setItem('token', JSON.stringify(''), () => {
            this.props.navigation.navigate('LoginScreen');
          });
          
          } },
        { text: 'Cancel'}])
  }



  render(){
    return(
      <View style = {styles.container}>
        <NavigationEvents
          onDidFocus={payload => this.showAlert()}
        />
        
        {global.expoToken && 
        <Text style={{fontSize:18}} onPress={() => {
          Clipboard.setString(global.expoToken);
          if (Platform.OS === 'android'){
            ToastAndroid.show('Token copied', ToastAndroid.SHORT);
          }
        }}>
          {global.expoToken}
        </Text>}
        <Text>Tap on token to copy</Text>
        <Text style={styles.itemTextVersion} numberOfLines={2}>
                Version {Constants.manifest.version}.{Platform.OS === 'android' ? Constants.manifest.android.versionCode : Constants.manifest.ios.buildNumber} 
          </Text>
      </View>
    )
  };
  

}

LogoutScreen.navigationOptions = {
  title: 'Setting',
  headerTintColor: 'white',
  headerStyle: {
    backgroundColor: '#455a69',
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  itemTextVersion: {
    fontSize: 17,
    color: 'gray'
  },
});