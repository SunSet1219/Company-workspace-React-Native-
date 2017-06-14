
'use strict';


import React, {
  PureComponent,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { Border1Color,  Border2Color, TextColor } = Theme.Palette;
const { MyKnotelContainerPaddingHorizontal } = UISharedConstants;
const PaddingHorizontal = 12;
const HorizontalOffset = (MyKnotelContainerPaddingHorizontal + PaddingHorizontal) * 2;
const AvatarSize = 40;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class Staff extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      landscape: false,
    };

    this.handleEmailInfoFieldPress = this.handleEmailInfoFieldPress.bind(this);
    this.renderMember = this.renderMember.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);
  }




  handleEmailInfoFieldPress(item) {
    const url = `mailto:${item.email}`;
    const onFailure = () => this.context.showToast('Unable to send email');

    Linking.canOpenURL(url).then(supported => {
      if (!supported) { return onFailure(); }
      Linking.openURL(url);
    }).catch(onFailure);
  }




  renderMember(item, i) {
    const avatarView = (
      <Image
        resizeMode='cover'
        source={{ uri: item.avatar }}
        style={styles.avatarImage}
      />
    );


    const renderInfoField = (fieldText) => (
      <Text style={styles.infoText}>
        {fieldText}
      </Text>
    );


    const emailInfoField = (
      <TouchableOpacity onPress={() => this.handleEmailInfoFieldPress(item)}>
        <Text style={[ styles.infoText, styles.emailLink ]}>
          {item.email}
        </Text>
      </TouchableOpacity>
    );


    const infoView = (
      <View style={styles.infoView}>
        {renderInfoField(item.name)}
        {renderInfoField(item.jobTitle)}
        {emailInfoField}
        {renderInfoField(item.phone)}
      </View>
    );


    const { landscape } = this.state;
    const justifyContent = landscape ? 'center' : 'flex-start';
    const width = landscape ?
      (Display.LongSide - HorizontalOffset) / 2 :
      (Display.ShortSide - HorizontalOffset);

    return (
      <View key={i} style={[ styles.memberView, { justifyContent, width }]}>
        {avatarView}
        {infoView}
      </View>
    );
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    const landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    const members = this.props.members.map(this.renderMember);

    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        {members}
      </View>
    );
  }

}

Staff.propTypes = {
  members: PropTypes.arrayOf(PropTypes.object),
};

Staff.defaultProps = {
  members: [],
};

Staff.contextTypes = {
  showToast: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingHorizontal: PaddingHorizontal,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Border1Color,
  },
  memberView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  avatarImage: {
    height: AvatarSize,
    width: AvatarSize,
    borderRadius: AvatarSize / 2,
    borderWidth: 1.5,
    borderColor: Border2Color,
    marginTop: 4,
  },
  infoView: {
    flex: -1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: PaddingHorizontal,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '100',
    color: TextColor,
    paddingTop: 2,
  },
  emailLink: {
    textDecorationLine: 'underline',
  },
});


export default Staff;
