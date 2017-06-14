
'use strict';


import React, {
  Component,

} from 'react';

import {
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  ListView,
  Dimensions
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import db from '../../api/db/realm-db';
import PropertyInfo from '../components/profile/property-info-new';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import userHelper from '../helpers/user-helper';
import LocationPreview from '../components/location/location-preview';
import icoMoonConfig from '../../resources/font/selection.json';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import firebase from 'firebase';
import {StackNavigator} from 'react-navigation'
const firebaseConfig={
  apiKey: "AIzaSyAoOsZTGG7N415oYhnqFpk2Da2E_-1TYVw",
    authDomain: "socialapp-e5e09.firebaseapp.com",
    databaseURL: "https://socialapp-e5e09.firebaseio.com",
    storageBucket: "socialapp-e5e09.appspot.com",
     messagingSenderId: "306902668184"
}
const firebaseApp = firebase.initializeApp(firebaseConfig);
const Icon = createIconSetFromIcoMoon(icoMoonConfig);

const { Border1Color, MainTextColorNew, StatusBarColor } = Theme.Palette;
const { SemiBoldFontSettings, TextFontSize,BoldFontSettings, HeaderFontSizeNew } = Theme.Font;
const { Scenes } = SharedConstants;








export default class Location extends Component {

  constructor(props) {
    super(props);
    this.state={
      dataSource:new ListView.DataSource({
        rowHasChanged:(row1, row2) => row1 !==row2
      })
    };
    this.goto = this.goto.bind(this);

  }




  componentWillMount() {

    var dataRef = firebaseApp.database().ref('test');
         dataRef.on("value",function(snapshot) {
          var messages=[];
          snapshot.forEach(function(aa){
                 messages.push({
                        _name:aa.child('name').val(),
                        _addr:aa.child('addr').val()
                    });

          })
           this.setState({
               loading:false,
                    dataSource: this.state.dataSource.cloneWithRows(messages)
            });

        }.bind(this));

    }








  render() {
    const { user, properties, companies } = this.props;


    const locationView = (
      <View style={styles.avatarView}>
        <LocationPreview
          user={user}
        />
      </View>
    );


    const statusBar = (
      <StatusBar
        barStyle='dark-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    const propertyInfo = (
      <PropertyInfo
        company={userHelper.getUserDefaultCompany(user, companies)}
        property={userHelper.getUserDefaultProperty(user, properties)}
      />
    );
    //const {navigate} = this.props.navigation;

    return (
      <View  style={styles.wrapperView}>
        {statusBar}
        {locationView}
        <ScrollView
          automaticZallyAdjustContentInsets={false}
          bounces={false}
          style={{backgroundColor:'#fafafa',marginTop:4}}
        >
          <Text style={styles.header}>Other locations</Text>
          <ListView dataSource={this.state.dataSource}
                    renderRow={this.renderRow.bind(this)}
                    automaticallyAdjustContentInsets={false}
                    enableHighAccuracy={true}
                    renderSeparator={(sectionID,rowID)=><View key={rowID} style={{height:1,backgroundColor:'#dedede'}}/>}
                    style={{marginTop:10,height:Dimensions.get('window').height,marginLeft:35,marginRight:35,backgroundColor:'#fafafa'}}
          />
        </ScrollView>
      </View>
    );
  }
  renderRow(rowData, sectionID, rowID){
    return(
      <View style={{width:Dimensions.get('window').width}}>
        <TouchableOpacity style={styles.all} onPress={() =>  this.goto(rowData)}
        >
         <View style={styles.icon}>
            <Icon name='my-knotel-fill'size={14} color={'#969696'}/>
         </View>
         <View>
            <View style={styles.all1}>
               <Text style={styles.name}>{rowData._name}</Text>
               <Text style={styles.time}>0.1mi</Text>
           </View>
               <Text style={styles.addr}>{rowData._addr}</Text>
         </View>

        </TouchableOpacity>
      </View>
    )
  }
  goto(data){
    return(
      <View>
        <Text>111111111</Text>
      </View>
    )
  }
}







const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  accountTabsView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingHorizontal: 20,
  },
  name: {
    fontFamily:'Gotham',
    fontWeight:'bold',
    fontSize: 16,
    color: '#333',
    marginTop:25,
    marginBottom:6,
  },
  addr: {
    fontFamily:'Gotham',
    fontSize: 16,
    color: '#333',
    marginBottom:25
  },
  avatarView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 160,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 1,
          height: 0.5,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: (Platform.Version < 21) ? {
        borderColor: 'black',
        borderWidth: 1,
      } : {
        backgroundColor: 'white',
        elevation: 4,
      },
    }),
  },
  labelItem: {
    ...SemiBoldFontSettings,
    fontSize: TextFontSize,
    color: MainTextColorNew,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  teamSize: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    color: MainTextColorNew,
    fontWeight: '400',
  },
  icon:{
    marginTop:28,
    marginRight:20,
  },
  all1:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    width:Dimensions.get('window').width-110
  },
  all:{
    flex:0,
    flexDirection:'row',

  },
  time:{
    fontFamily:'Gotham',
    marginTop:26,
    fontSize: 13,
    opacity:0.6

  },
  header:{
    fontSize:16,
    marginTop:24,
    color: '#333',
    marginLeft:34,
    fontFamily:'Gotham',
    fontWeight:'600'
  }
});
