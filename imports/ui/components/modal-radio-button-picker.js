
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import ModalDialog from './modal-dialog';
import RadioButtonMenuItem from './radio-button-menu-item';




class ModalRadioButtonPicker extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: props.initialSelectedIndex,
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }




  handleSelect(index) {
    this.setState({ selectedIndex: index });
  }





  handleSubmit() {
    let { onSubmit, items } = this.props;
    let { selectedIndex } = this.state;
    onSubmit(items[selectedIndex]);
  }




  render() {
    let props = this.props;


    let items = props.items.map((item, i) => (
      <RadioButtonMenuItem
        key={i}
        index={i}
        selected={i === this.state.selectedIndex}
        onSelect={this.handleSelect}
        label={item.label}
        style={styles.itemView}
      />
    ));


    return (
      <ModalDialog
        title={props.title}
        onCancel={props.onCancel}
        onSubmit={this.handleSubmit}
        visible={props.visible}
      >
        <ScrollView>
          {items}
        </ScrollView>
      </ModalDialog>
    );
  }

}

ModalRadioButtonPicker.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
  initialSelectedIndex: PropTypes.number,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  visible: PropTypes.bool,
};

ModalRadioButtonPicker.defaultProps = {
  title: '',
  items: [],
  initialSelectedIndex: 0,
  onCancel: () => {},
  onSubmit: () => {},
  visible: false,
};




const styles = StyleSheet.create({
  itemView: {
    minHeight: 40,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});


export default ModalRadioButtonPicker;
