
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

import Avatar from './avatar';
import Meteor from 'baryshok-react-native-meteor';
import Theme from '../theme';
import userHelper from '../helpers/user-helper';

const { TextColor } = Theme.Palette;




class CurrentUserDataView extends Component {

  constructor(props) {
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
  }




  componentWillMount() {
    Meteor.getData().on('onLogin', this.handleLogin);
  }




  componentWillUnmount() {
    Meteor.getData().off('onLogin', this.handleLogin);
  }




  handleLogin() {
    this.forceUpdate();
  }




  render() {
    let { username, email, avatarUrl } = userHelper.getUserDataForAvatar();
    let props = this.props;

    return (
      <View style={!props.style ? styles.wrapperView : [ styles.wrapperView, props.style ]}>
        <Avatar
          username={username}
          email={email}
          avatarUrl={avatarUrl}
        />
        <View style={styles.labelsView}>
          <Text numberOfLines={1} style={styles.upperLabelText}>
            {username}
          </Text>
          <Text numberOfLines={1} style={styles.lowerLabelText}>
            {email}
          </Text>
        </View>
      </View>
    );
  }

}

CurrentUserDataView.propTypes = {
  style: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  labelsView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  upperLabelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TextColor,
  },
  lowerLabelText: {
    fontSize: 16,
    color: TextColor,
  },
});



export default CurrentUserDataView;
