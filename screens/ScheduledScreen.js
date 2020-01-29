import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
  Text,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser'
import { Appbar } from 'react-native-paper';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import Moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DateTimePicker from 'react-native-modal-datetime-picker';

import SchedulerView from '../components/Guests/SchedulerView';
import ShareView from '../components/Guests/ShareView';
import EditReservationView from '../components/Guests/EditReservationView';
import Constant from '../constants/Constant';


export default class ScheduledScreen extends React.Component {

  constructor(props) {
    super(props);

    this.item = this.props.navigation.getParam('item');

    this.state = {
      messages: [],
      viewSelect: 1,
      selectIndexTop: 0,
      selectIndexBot: 0,
      isDateTimePickerVisible: false,
      isPickingCheckIn: true,
      checkInDate: new Date(this.item.check_in),
      checkOutDate: new Date(this.item.check_out),
      shareOption: [],
      sent_scheduled_messages: this.item.sent_scheduled_messages,
      isLoading: false,
    };

  }

  componentDidMount(){
    this.getMessage()
    this.getListAction()
  }

  getListAction = async () => {

    try {
      const url = Constant.severUrl + 'api/scheduler'
      console.log(url)
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          Cookie: global.cookies,
        },
      });
      let responseJson = await response.json();

      if (responseJson && Object.keys(responseJson).length > 0){
        console.log(responseJson);
        this.setState({shareOption: responseJson})
      } else{
        console.log('no action found');
      }
      
    } catch (error) {
      console.error(error);
    }
  }

  creatMessage = (res) => {

    let messages = [];
    res.forEach( item =>{
      const m = {
        _id: item.id,
        text: item.content,
        createdAt: item.created_at,
        user: {
          _id: item.sender_type,
          name: item.sender_type,
          avatar: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Facebook_default_male_avatar.gif',
        },
      }
      messages.push(m);
    })
    return messages.reverse()

  }

  getMessage = async () => {

    if (!this.item.thread_id){
      return
    }
    
    this.setState({isLoading:true})

    try {
      const url = Constant.severUrl + `api/messaging/thread/${this.item.thread_id}`
      console.log(url)
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          Cookie: global.cookies,
        },
      });
      let responseJson = await response.json();

      if (responseJson && Object.keys(responseJson).length > 0){
        console.log(responseJson);
        let mes = this.creatMessage(responseJson.messages)
        this.setState({isLoading:false, guest: responseJson.guest, messages: mes})
      } else{
        console.log('no data');
        this.setState({isLoading:false})
      }
       
      
    } catch (error) {
      console.error(error);
      this.setState({isLoading:false})
    }
  }


  _goBack = () => this.props.navigation.goBack();


  appBarSetect = (index) => {
    console.log('Index:', index);
    if (index == 4){
      if (this.item.rental_id){
        WebBrowser.openBrowserAsync(`https://www.ruebarue.com/guestbook/${this.item.guestlink_id}`)
      } else if (this.item.rental_id){
        WebBrowser.openBrowserAsync(`https://www.ruebarue.com/rental/${this.item.rental_id}`)
      } else{
        Alert.alert('Delete guest', 'Are you sure?', 
        [{ text: 'OK', onPress: () => {  this.props.navigation.goBack();} },
        { text: 'Cancel'}])
        return
      }
      
    } else if (index == 5){
      Alert.alert('Delete guest', 'Are you sure?', 
        [{ text: 'OK', onPress: () => {  this.props.navigation.goBack();} },
        { text: 'Cancel'}])
        return
    } 
    this.setState({viewSelect:index})
  }

  shareRequest = async (messageId)=>{

    this.setState({isLoading:true})

    try {

      const url = Constant.severUrl + `api/scheduler/${messageId}/reservation/${this.item.id}/send`
      console.log(url)

      let response = await fetch(url, {
        method: 'POST',
        headers: {
          Cookie: global.cookies,
        }
      });
      
      let responseJson = await response.json();
      
      if (responseJson && Object.keys(responseJson).length > 0){
        console.log(responseJson);
        const newValue = this.state.sent_scheduled_messages + ` ${messageId}`
        this.setState({sent_scheduled_messages: newValue, isLoading:false}) 
      } else{
        this.setState({isLoading:false})
        Alert.alert('Error', 'no response from sever')
      }
      
    } catch (error) {
      this.setState({isLoading:false})
      Alert.alert('Error',error.message)
      console.error(error);
    }

  }

  onSend(messages = []) {
    console.log(messages[0].text);
    this.sendMessage(messages);
  }

  sendMessage = async (messages)=>{

    Keyboard.dismiss();
    this.setState({isLoading:true})

    try {
      let formdata = new FormData();

      formdata.append('message', messages[0].text)
      formdata.append('thread_id', this.item.thread_id)


      const url = Constant.severUrl + 'api/messaging/inbound/app'
      console.log(url)
      console.log(formdata)

      let response = await fetch(url, {
        method: 'POST',
        headers: {
          Cookie: global.cookies,
        },
        body: formdata,
      });
      
      let responseJson = await response.json();
      console.log(responseJson);
      if (responseJson && Object.keys(responseJson).length > 0){
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, messages), isLoading:false
        }))
      } else{
        this.setState({isLoading:false})
        Alert.alert('Error', 'no data')
      }
      
    } catch (error) {
      this.setState({isLoading:false})
      Alert.alert('Error',error.message)
      console.error(error);
    }

  }

  renderBubble= (props) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          left: {
            color: 'white',
          },
          right: {
            color: 'black',
          },
        }}
        wrapperStyle={{
          left: {
            backgroundColor: '#4d6b85',
          },
          right: {
            backgroundColor: 'white',
          },
        }}
        
      />
    );
  }

  formatTime = (timeStr) => {
    let newDate = new Date(timeStr);
    return Moment(newDate).format("MM/DD/YYYY");
  }

  _showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  }

  _hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false});
  }

  _handleDatePicked = (date) => {
    console.log('A date has been picked: ', date);
    if (this.state.isPickingCheckIn){
      this.setState({  isDateTimePickerVisible: false, checkInDate: date }); 
    } else{
      this.setState({ isDateTimePickerVisible: false, checkOutDate: date });
    }
    
  };


  render(){

    const item = this.item
    const start_time = this.formatTime(item.check_in);
    const end_time = this.formatTime(item.check_out);
    const {viewSelect} = this.state

    let appBarIcon = [
      'calendar-text',
      'chart-bubble',
      'share',
      'square-edit-outline',
      'delete-forever'
    ]

    if (this.item.rental_id || this.item.guestlink_id){
      appBarIcon = [
        'calendar-text',
        'chart-bubble',
        'share',
        'square-edit-outline',
        'link-variant',
        'delete-forever'
      ]
    }
    

    const appBar = appBarIcon.map( (icon, index) =>
      <Appbar.Action 
        key = {icon}
        color =  {viewSelect == index ? 'white' : 'darkgray'} 
        icon= {icon}
        onPress={()=>this.appBarSetect(index)} 
      />
    )

    let contentView;
    switch (viewSelect) {
      case 0:
        contentView = (
          <SchedulerView
            messagesIds={this.state.sent_scheduled_messages} 
            options={this.state.shareOption}
            onPress={(messageId)=> this.shareRequest(messageId) }
          />
        )
        break;
      case 1:
        contentView = (
          <GiftedChat
            renderBubble={this.renderBubble}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: 'recipient' || 'automated',
            }}
          />
        )
        break;
      case 2:
        contentView=(
          <KeyboardAwareScrollView enableOnAndroid={true}>
            <ShareView 
              item={item} 
              options={this.state.shareOption}
              selectIndexTop={this.state.selectIndexTop} 
              onPress={(index)=> this.setState({selectIndexTop:index}) }
              cancelPress={()=>
                // this.props.navigation.goBack()
                this.setState({viewSelect:1})
              }
            />
          </KeyboardAwareScrollView>
        )
        break
      case 3:
          contentView = (
            <KeyboardAwareScrollView enableOnAndroid={true}>
              <EditReservationView 
                item= {item} 
                showDatePicker={this.state.isDateTimePickerVisible} 
                checkIn = {this.state.checkInDate}
                checkOut = {this.state.checkOutDate}
                onPressTimePicker={(value)=> {
                  this.setState({isDateTimePickerVisible: true, isPickingCheckIn: value})} 
                }
                cancelPress={()=>
                  // this.props.navigation.goBack()
                  this.setState({viewSelect:1})
                }
                />
            </KeyboardAwareScrollView>
          )
          break;
      default:
        contentView = (
          <View/>
        )
        break;
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <Appbar.Header style={{backgroundColor:'#455a69'}}>
          <Appbar.BackAction
            onPress={this._goBack}
          />
          <Appbar.Content
            title=""
          />
          {appBar}
        </Appbar.Header>

        <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          // date={toDay}
          // maximumDate = {toDay}
        />

        <View style={styles.headContainer}> 
            <View style={styles.topContainer}>

              <Image
                style={styles.avatar}
                source={{ uri: 'https://facebook.github.io/react-native/img/tiny_logo.png' }}
              />
              <View style={{marginLeft: 10, flex: 1}}>
              
                  <Text style= {styles.nameText}>{`${item.first_name} ${item.last_name}`}</Text>
                  <Text style={styles.locationText}>{item.rental_name}</Text>
                  <Text style={styles.durationText}>{start_time} - {end_time}</Text>

              </View>

            </View>

            <View style={{flexDirection:'row', marginTop: 4}}>
              <Text style={[styles.codeText, {color: 'dimgray', marginLeft: 20}]}>Email: </Text>
              <Text style={[styles.codeText, {color: '#0074D9'}]}>{item.email}</Text>
            </View>

            <View style={{flexDirection:'row', marginTop: 4}}>
              <Text style={[styles.codeText, {color: 'dimgray', marginLeft: 20}]}>Phone:</Text>
              <Text style={[styles.codeText, {color: '#0074D9'}]}>{item.phone}</Text>
            </View>

            {item.door_code && 
              <View style={{flexDirection:'row', marginTop: 4}}>
                <Text style={[styles.codeText, {color: 'dimgray', marginLeft: 20}]}>Door Code: </Text>
                <Text style={styles.codeText}>{item.door_code}</Text>
              </View>
            }

        </View>
          
          {contentView}

          {this.state.isLoading &&
              <View style={styles.loadingStyle}>
                <ActivityIndicator size='large' />
              </View>
            }

          
    </View>
    );
  }
  
}

ScheduledScreen.navigationOptions = {
  title: 'Chat',
  headerTintColor: 'white',
  headerStyle: {
    backgroundColor: '#455a69',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  headContainer: {
    backgroundColor: 'white',
    borderColor: 'darkgray',
    margin: 0,
    paddingBottom: 20,
  },
  loadingStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  topContainer: {
    flexDirection: 'row',
    margin: 20,
  },
  avatar: {
    width: 50, 
    height: 50,
    borderRadius: 25,
  },
  nameText: {
    fontSize: 20,
  },
  durationText: {
    color: 'dimgray',
    fontSize: 13,
  },
  locationText: {
    color: 'dimgray',
    fontSize: 15,
  },
  contentText: {
    textAlign: 'justify',
    fontWeight: '300',
    fontSize: 15,
    marginHorizontal: 20
  },
  codeText: {
    textAlign: 'justify',
    fontWeight: '300',
    fontSize: 15
  }
});
