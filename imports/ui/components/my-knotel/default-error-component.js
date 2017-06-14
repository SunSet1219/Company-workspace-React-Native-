
'use strict';

import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
} from 'react-native';

const DefaultErrorComponent = (props) => {
  return (() => (<Text style={styles.text}>{ props.errorMessage }</Text>));
};


DefaultErrorComponent.propTypes = {
  errorMessage: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: 'red',
  }
});

export default DefaultErrorComponent;

