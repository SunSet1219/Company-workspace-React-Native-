
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

import { MKButton } from '../material-ui';
import Theme from '../theme';

const { RaisedDisabledButton1Color, RaisedDisabledButtonLabel1Color, WhiteTextColor } = Theme.Palette;
const FontSize = 14;




const RaisedButton = (props) => {

  let buildButton = () => {
    let RaisedButton;

    if (props.primary) {
      RaisedButton = MKButton.coloredButton();
    } else if (props.secondary) {
      RaisedButton = MKButton.accentColoredButton();
    } else {
      RaisedButton = MKButton.button();
    }

    if (props.backgroundColor) {
      RaisedButton = RaisedButton.withBackgroundColor(props.backgroundColor);
    }
    if (props.label && !props.icon) {
      RaisedButton = RaisedButton.withText(props.label);
    }
    if (props.labelStyle) {
      RaisedButton = RaisedButton.withTextStyle(props.labelStyle);
    }
    if (props.onPress) {
      RaisedButton = RaisedButton.withOnPress(props.onPress);
    }
    if (props.style) {
      RaisedButton = RaisedButton.withStyle(props.style);
    }

    return RaisedButton.build();
  };



  let renderButton = () => {
    let RaisedButton = buildButton();
    let { icon, labelPosition } = props;

    return icon ? (
      <RaisedButton>
        <View style={styles.buttonChildrenWrapper}>

          { labelPosition === 'after' ? props.icon : null }

          <Text
            style={[
              styles.buttonText,
              labelPosition === 'after' ? { marginLeft: 5 } : { marginRight: 5 },
              props.labelStyle
            ]}
          >
            {props.label}
          </Text>

          { labelPosition === 'before' ? props.icon : null }

        </View>
      </RaisedButton>
    ) : (
      <RaisedButton />
    );
  };



  let renderDisabledButton = () => {
    let { icon, labelPosition } = props;

    return (
      <View
        style={[
          styles.disabledButtonView,
          props.style,
          props.disabledBackgroundColor &&
            { backgroundColor: props.disabledBackgroundColor }
        ]}
      >

        { icon && labelPosition === 'after' ? icon : null }

        <Text
          style={[
            icon && (labelPosition === 'after' ? { marginLeft: 5 } : { marginRight: 5 }),
            styles.disabledButtonText,
            props.labelStyle,
            props.disabledLabelColor &&
              { color: props.disabledLabelColor }
          ]}
        >
          {props.label}
        </Text>

        { icon && labelPosition === 'before' ? icon : null }

      </View>
    );
  };


  return !props.disabled ? renderButton() : renderDisabledButton();

};

RaisedButton.propTypes = {
  backgroundColor: PropTypes.string,
  disabled: PropTypes.bool,
  disabledBackgroundColor: PropTypes.string,
  disabledLabelColor: PropTypes.string,
  icon: PropTypes.element,
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf([ 'before', 'after' ]),
  labelStyle: Text.propTypes.style,
  onPress: PropTypes.func,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  style: View.propTypes.style,
};

RaisedButton.defaultProps = {
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
    backgroundColor: RaisedDisabledButton1Color,
    borderRadius: 2,
    overflow: 'hidden',
    padding: 8,
  },
  disabledButtonText: {
    fontSize: FontSize,
    fontWeight: 'normal',
    color: RaisedDisabledButtonLabel1Color,
  },
  buttonText: {
    fontSize: FontSize,
    fontWeight: 'bold',
    color: WhiteTextColor,
  },
});


export default RaisedButton;
