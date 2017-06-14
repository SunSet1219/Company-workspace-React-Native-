
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Theme from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons'

const { HeaderFontSizeNew, BoldFontSettings } = Theme.Font;
const { MainTextColorNew } = Theme.Palette;



const ProfilePreview = (props) => {

  const profileView = () => {



    return (
      <View style={styles.wrapperView}>
        <View style={styles.icon}>
          <Icon name={'clear'} size={19}  color='#000'/>
          <Icon name={'more-horiz'} size={20} color='#000'/>
        </View>
        <View style={styles.nameview}>

            <Text style={styles.name}>
              Knotel Union sq.1
            </Text>
            <View style={styles.mybuilding}>
              <Text style={styles.text}>
                My Building
              </Text>
            </View>
          </View>
        <Text style={styles.addr}>33 W 17th Street</Text>
      </View>
    );
  };


  return profileView()

};





const styles = StyleSheet.create({
  wrapperView: {


  },
  name: {
    fontWeight:'bold',
    fontSize: 24,
    color: '#333333',


  },
  addr:{
    marginBottom:5,
    marginTop:5,
    fontSize:16,
    color:'#333'
      },
  nameview:{
    marginTop:25,
    flexDirection:'row',
    justifyContent:'center',


  },
  mybuilding:{
    marginLeft:30,
    backgroundColor:'#ff6347',
    alignItems:'center',
    justifyContent:'center',
    height:17,
    width:80,
    alignSelf:'center'
  },
  text:{
    color:'white',
    paddingLeft:5,
    paddingRight:5,
    fontSize:11,
    fontFamily:'Gotham',
    fontWeight:'bold'
  },
  icon:{
    flex:0,
    flexDirection:'row',
    justifyContent:'space-between',
  }

});


export default ProfilePreview;
