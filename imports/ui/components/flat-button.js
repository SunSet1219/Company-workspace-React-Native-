
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { MKButton, getTheme } from '../material-ui';
import Theme from '../theme';

const { TextColor, FlatDisabledButtonLabelColor } = Theme.Palette;

let DefaultButtonTextStyle = {
  fontSize: 12,
  fontWeight: 'normal',
};




const FlatButton = (props) => {

  let getTextColor = () => {
    let textColor;

    if (props.primary){
      textColor = getTheme().primaryColor;
    } else if (props.secondary) {
      textColor = getTheme().accentColor;
    } else {
      textColor = TextColor;
    }

    return textColor;
  };




  let buildButton = () => {
    let FlatButton;

    if (props.primary){
      FlatButton = MKButton.coloredFlatButton();
    } else if (props.secondary) {
      FlatButton = MKButton.accentColoredFlatButton();
    } else {
      FlatButton = MKButton.flatButton();
    }

    if (props.backgroundColor) {
      FlatButton = FlatButton.withBackgroundColor(props.backgroundColor);
    }
    if (props.label && !props.icon) {
      FlatButton = FlatButton.withText(props.label);
    }
    if (props.labelStyle) {
      FlatButton = FlatButton.withTextStyle(props.labelStyle);
    } else {
      FlatButton = FlatButton.withTextStyle(
        Object.assign({}, DefaultButtonTextStyle, { color: getTextColor() })
      );
    }
    if (props.onPress) {
      FlatButton = FlatButton.withOnPress(props.onPress);
    }
    if (props.style) {
      FlatButton = FlatButton.withStyle(props.style);
    }

    return FlatButton.build();
  };




  let renderButton = () => {
    let FlatButton = buildButton();
    let { icon, labelPosition } = props;

    return icon ? (
      <FlatButton>
        <View style={[ styles.buttonChildrenWrapper, props.style ]}>

          { labelPosition === 'after' ? props.icon : null }

          <Text
            style={[
              labelPosition === 'after' ? { marginLeft: 5 } : { marginRight: 5 },
              props.labelStyle
            ]}
          >
            {props.label}
          </Text>

          { labelPosition === 'before' ? props.icon : null }

        </View>
      </FlatButton>
    ) : (
      <FlatButton />
    );
  };




  let renderDisabledButton = () => {
    let { icon, labelPosition } = props;

    return (
      <View style={[ styles.disabledButtonView, props.style ]}>

        { icon && labelPosition === 'after' ? icon : null }

        <Text
          style={[
            labelPosition === 'after' ? { marginLeft: 5 } : { marginRight: 5 },
            styles.disabledButtonText,
            props.disabledLabelStyle
          ]}
        >
          {props.label}
        </Text>

        { icon && labelPosition === 'before' ? icon : null }

      </View>
    );
  };



  return props.disabled ? renderDisabledButton() : renderButton();

};

FlatButton.propTypes = {
  backgroundColor: PropTypes.string,
  disabled: PropTypes.bool,
  disabledLabelStyle: Text.propTypes.style,
  icon: PropTypes.element,
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf([ 'before', 'after' ]),
  labelStyle: Text.propTypes.style,
  onPress: PropTypes.func,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  style: View.propTypes.style
};

FlatButton.defaultProps = {
  disabled: false,
  labelPosition: 'after',
  primary: true,
  secondary: false
};




const styles = StyleSheet.create({
  buttonChildrenWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 2,
    overflow: 'hidden',
    padding: 8,
  },
  disabledButtonText: {
    fontSize: 14,
    color: FlatDisabledButtonLabelColor,
  },
});


export default FlatButton;
