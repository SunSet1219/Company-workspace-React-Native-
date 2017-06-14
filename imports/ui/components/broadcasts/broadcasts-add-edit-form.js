
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

import { Actions } from 'react-native-router-flux';
import { Duration } from '../snackbar';
import { MKSwitch, MKTextField } from '../../material-ui';
import ActionButtonsBar from '../action-buttons-bar';
import DateTimePicker from '../date-time-picker';
import DropdownMenu from '../dropdown-menu';
import FlatButton from '../flat-button';
import InviteeView from '../invitee-view';
import Meteor from 'baryshok-react-native-meteor';
import moment from '../../../api/unpackaged-improvements/moment';
import SharedConstants from '../../../api/constants/shared';
import SubsceneWrapper from '../subscene-wrapper';
import Theme from '../../theme';
import validationHelper from '../../helpers/validationHelper';

const { TextColor, TextInputErrorColor, Canvas2Color, Border1Color } = Theme.Palette;
const { HeaderFontSize, MenuFontSize } = Theme.Font;

const FontSize = MenuFontSize;
const PickerViewHeight = FontSize * 2;
const SwitchTrackSize = 17;
const SwitchTrackLength = 40;
const SwitchThumbRadius = 12;




class BroadcastsAddEditForm extends Component {

  constructor(props) {
    super(props);

    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.canSubmit = this.canSubmit.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.renderTargetPropertiesInput = this.renderTargetPropertiesInput.bind(this);


    let { editing, broadcast, properties } = props;

    let title = broadcast && broadcast.title || '';
    let message = broadcast && broadcast.message && broadcast.message.text || '';
    let notes = broadcast && broadcast.notes || '';

    let propertiesTimeZone = SharedConstants.propertiesTimeZone;
    let sendTime = broadcast && broadcast.sendTime;
    sendTime = moment(sendTime).tz(propertiesTimeZone);
    if (!sendTime.isValid()) {
      sendTime = moment().tz(propertiesTimeZone);
    }

    let emergency = Boolean(broadcast && broadcast.isEmergency);

    let endpoints = broadcast && broadcast.endpoints;
    let isEndpointActive = (type) => (
      Boolean(endpoints && endpoints.find(endpoint => endpoint.type === type && endpoint.active))
    );
    let emailEndpoint = isEndpointActive('email');
    let smsEndpoint = isEndpointActive('sms');
    let appEndpoint = isEndpointActive('app');

    let targetIds = broadcast && broadcast.targets && broadcast.targets.map(target => target.targetId);
    let allProperties = properties && properties.map(property => ({
      id: property._id,
      label: property.title,
    })) || [];
    let targetProperties = targetIds && targetIds.map(targetId =>
      allProperties.find(item => item.id === targetId)
    ) || [];


    this.state = {
      editing,

      title,
      titleValidated: title !== '',
      titleError: ' ',

      message,
      messageValidated: message !== '',
      messageError: ' ',

      token: '',
      tokenValidated: false,
      tokenError: ' ',

      notes,

      sendTime,
      sendTimeSet: editing,

      showIosDatePicker: false,
      showIosTimePicker: false,

      emergency,
      smsEndpoint,
      emailEndpoint,
      appEndpoint,
      targetProperties,
    };

    this.subsceneWrapper = null;
    this.keyboardAwareScrollViewTextInputs = [];

    this.titleInputEdited = false;

    this.messageInputView = null;
    this.messageTextInput = null;
    this.messageInputEdited = false;

    this.notesInputView = null;
    this.notesTextInput = null;
    this.notesInputEdited = false;

    this.tokenInputView = null;
    this.tokenTextInput = null;
    this.tokenInputEdited = false;

    this.allProperties = allProperties;
    this.targetPropertiesInputHeight;
  }




  registerInKeyboardAwareScrollView(view, textInput) {
    if (view && textInput) {
      this.keyboardAwareScrollViewTextInputs.push({ view, textInput });
    }
  }




  handleDateTimeChange(dateTime) {
    this.setState({
      sendTime: dateTime,
      sendTimeSet: true,
    });
  }



  canSubmit() {
    let { titleValidated, messageValidated, sendTimeSet, targetProperties } = this.state;
    let { emailEndpoint, smsEndpoint, appEndpoint, emergency, tokenValidated } = this.state;
    let endpointsValidated = emailEndpoint || (smsEndpoint && emergency) || appEndpoint;
    let targetsValidated = Boolean(targetProperties && targetProperties.length);

    if (
      !titleValidated ||
      !messageValidated ||
      !endpointsValidated ||
      !sendTimeSet ||
      !targetsValidated ||
      !tokenValidated
    ) {
      return false;
    }
    return true;
  }




  handleSave() {
    let { broadcast } = this.props;
    let { editing, title, message, notes, sendTime, targetProperties } = this.state;
    let { emergency, emailEndpoint, smsEndpoint, appEndpoint, token } = this.state;

    let data = {
      title: title,
      message: {
        html: `<p>${message}</p>`,
        text: message,
      },
      notes: notes,
      sendTime: sendTime.utc().format(),
      targets: targetProperties.map(targetProperty => ({
        type: targetProperty.label,
        targetId: targetProperty.id,
      })),
      isEmergency: emergency,
      endpoints: [
        { type: 'email', active: emailEndpoint },
        { type: 'sms', active: smsEndpoint && emergency },
        { type: 'app', active: appEndpoint }
      ],
    };

    if (editing) {
      Meteor.call('updateBroadcast', token.trim(), broadcast._id, data, (error) => {
        if (error) {
          return this.context.showSnackbar({
            message: error.reason || 'Failed to update broadcast',
            duration: Duration.Indefinite,
            button: {
              label: 'CLOSE',
            },
          });
        }

        this.context.showSnackbar({
          message: 'Broadcast updated successfully',
          duration: Duration.Short,
        });
        Actions.pop();
      });
    } else {
      Meteor.call('addNewBroadcast', token.trim(), data, (error) => {
        if (error) {
          return this.context.showSnackbar({
            message: error.reason || 'Failed to add broadcast',
            duration: Duration.Indefinite,
            button: {
              label: 'CLOSE',
            },
          });
        }

        this.context.showSnackbar({
          message: 'Broadcast added successfully',
          duration: Duration.Short,
        });
        Actions.pop();
      });
    }
  }




  handleCancel() {
    Actions.pop();
  }




  renderTargetPropertiesInput() {
    let state = this.state;


    let targetPropertiesDropdownMenuItems = [{ label: 'Add all locations' }];
    this.allProperties.forEach(item => {
      let itemSelected = state.targetProperties.some(targetProperty => targetProperty.id === item.id);
      if (!itemSelected) {
        targetPropertiesDropdownMenuItems.push(item);
      }
    });


    let addTargetProperty = (item, index) => {
      let targetProperties = state.targetProperties.slice();
      if (item.label === 'Add all locations') {
        targetProperties = this.allProperties.slice();
      } else {
        let propertyToAdd = this.allProperties.find(property => property.id === item.id);
        if (propertyToAdd) {
          targetProperties.push(propertyToAdd);
        }
      }
      this.setState({ targetProperties });
    };


    let targetPropertiesDropdownMenu = (
      <DropdownMenu
        menuItems={targetPropertiesDropdownMenuItems}
        onChange={addTargetProperty}
        style={styles.targetPropertiesDropdownMenu}
        fontSize={FontSize}
        placeholder='Select target properties'
        showPlaceholderInsteadOfSelectedValue={true}
      />
    );


    let removeTargetProperty = (index) => {
      let targetProperties = state.targetProperties.slice();
      targetProperties.splice(index, 1);
      this.setState({ targetProperties });
    }


    let targetPropertiesItems = state.targetProperties.map((item, i) => (
      <InviteeView
        key={item.id}
        index={i}
        label={item.label}
        onRemove={removeTargetProperty}
      />
    ));


    let onLayout = (event) => {
      let prevHeight = this.targetPropertiesInputHeight;
      let currentHeight = event.nativeEvent.layout.height;
      if (prevHeight && (currentHeight !== prevHeight) && (currentHeight - prevHeight > 0)) {
        this.subsceneWrapper &&
        this.subsceneWrapper.scrollBy &&
        this.subsceneWrapper.scrollBy({ offsetY: currentHeight - prevHeight, animated: false });
      }
      this.targetPropertiesInputHeight = currentHeight;
    };


    return (
      <View
        onLayout={onLayout}
        style={styles.settingsGroupView}
      >
        <View style={styles.settingsGroupLabelView}>
          <Text style={styles.text}>
            Target properties (required)
          </Text>
        </View>
        <View style={styles.targetPropertiesInputView}>
          {targetPropertiesDropdownMenu}
          <View style={styles.targetPropertiesItemsWrapperView}>
            {targetPropertiesItems}
          </View>
        </View>
      </View>
    );
  }




  render() {
    let state = this.state;


    let headerText = (
      <Text style={styles.headerText}>
        {state.editing ? 'Edit broadcast' : 'Add broadcast'}
      </Text>
    );


    let titleInput = (
      <View style={styles.inputView}>
        <MKTextField
          autoCapitalize='none'
          autoCorrect={false}
          onSubmitEditing={() => {
            this.messageTextInput &&
            this.messageTextInput.focus();
          }}
          onTextChange={text => {
            if (!this.titleInputEdited) { this.titleInputEdited = true; }
            let validationResult = validationHelper.isRequiredFieldNotEmpty(text, 'Title');
            this.setState({
              title: text,
              titleValidated: validationResult.validated,
              titleError: validationResult.error,
            });
          }}
          placeholder='Title (required)'
          returnKeyType='next'
          style={styles.textInputView}
          value={state.title}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!state.titleValidated && this.titleInputEdited ? TextInputErrorColor : null}
          tintColor={!state.titleValidated && this.titleInputEdited ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={styles.inputErrorText}>
          {state.titleError}
        </Text>
      </View>
    );


    let messageInput = (
      <View
        ref={ref => this.messageInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.messageInputView,
            this.messageTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.messageTextInput = ref}
          autoCapitalize='sentences'
          autoCorrect={false}
          onSubmitEditing={() => {
            this.notesTextInput &&
            this.notesTextInput.focus();
          }}
          onTextChange={text => {
            if (!this.messageInputEdited) { this.messageInputEdited = true; }
            let validationResult = validationHelper.isRequiredFieldNotEmpty(text, 'Message');
            this.setState({
              message: text,
              messageValidated: validationResult.validated,
              messageError: validationResult.error,
            })
          }}
          multiline={true}
          placeholder='Message (required)'
          returnKeyType='next'
          style={styles.textInputMultilineView}
          value={state.message}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!state.messageValidated && this.messageInputEdited ? TextInputErrorColor : null}
          tintColor={!state.messageValidated && this.messageInputEdited ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={styles.inputErrorText}>
          {state.messageError}
        </Text>
      </View>
    );


    let notesInput = (
      <View
        ref={ref => this.notesInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.notesInputView,
            this.notesTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.notesTextInput = ref}
          autoCapitalize='sentences'
          autoCorrect={false}
          onTextChange={text => this.setState({ notes: text })}
          multiline={true}
          placeholder='Notes'
          returnKeyType='done'
          style={styles.textInputMultilineView}
          value={state.notes}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          textInputStyle={styles.textInput}
        />
      </View>
    );


    let emergencyInput = (
      <View style={styles.emergencyView}>
        <Text style={styles.text}>
          Emergency
        </Text>
        <MKSwitch
          checked={state.emergency}
          onCheckedChange={() => this.setState({ emergency: !this.state.emergency })}
          trackSize={SwitchTrackSize}
          trackLength={SwitchTrackLength}
          thumbRadius={SwitchThumbRadius}
        />
      </View>
    );


    let renderEndpointsSettingsItem = (label, statePropName, haveBottomBorder) => (
      this.state.emergency || label !== 'SMS' ? (
        <View style={
          haveBottomBorder ?
            styles.endpointsSettingsItemViewWithBottomBorder :
            styles.endpointsSettingsItemView
        }>
          <Text style={styles.text}>
            {label}
          </Text>
          <MKSwitch
            checked={state[statePropName]}
            onCheckedChange={() => {
              let nextState = {};
              nextState[statePropName] = !state[statePropName];
              this.setState(nextState);
            }}
            trackSize={SwitchTrackSize}
            trackLength={SwitchTrackLength}
            thumbRadius={SwitchThumbRadius}
          />
        </View>
      ) : null
    );


    let endpointsInput = (
      <View style={styles.settingsGroupView}>
        <View style={styles.settingsGroupLabelView}>
          <Text style={styles.text}>
            Endpoints (required)
          </Text>
        </View>
        <View style={styles.endpointsSettingsItemsWrapperView}>
          {renderEndpointsSettingsItem('Email', 'emailEndpoint', true)}
          {renderEndpointsSettingsItem('SMS', 'smsEndpoint', true)}
          {renderEndpointsSettingsItem('App', 'appEndpoint')}
        </View>
      </View>
    );


    let datePicker = (
      <DateTimePicker
        initialDateTime={state.sendTime}
        mode='date'
        onDateTimeChange={this.handleDateTimeChange}
        style={styles.pickerViewWithMarginRight}
      >
        <Text style={styles.text}>
          {state.sendTimeSet ? state.sendTime.format('YYYY-MM-DD') : 'Send Date'}
        </Text>
      </DateTimePicker>
    );


    let timePicker = (
      <DateTimePicker
        initialDateTime={state.sendTime}
        mode='time'
        onDateTimeChange={this.handleDateTimeChange}
        style={styles.pickerViewWithMarginLeft}
      >
        <Text style={styles.text}>
          {state.sendTimeSet ? state.sendTime.format('h:mm a z') : 'Time (EST)'}
        </Text>
      </DateTimePicker>
    );


    let sendDateAndTimeInput = (
      <View style={styles.settingsGroupView}>
        <View style={styles.settingsGroupLabelView}>
          <Text style={styles.text}>
            Send Date and Time (required)
          </Text>
        </View>
        <View style={styles.sendDateTimeItemsWrapperView}>
          {datePicker}
          {timePicker}
        </View>
      </View>
    );


    let tokenInput = (
      <View
        ref={ref => this.tokenInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.tokenInputView,
            this.tokenTextInput
          );
        }}
        style={styles.tokenInputView}
      >
        <MKTextField
          ref={ref => this.tokenTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='numeric'
          onTextChange={text => {
            if (!this.tokenInputEdited) { this.tokenInputEdited = true; }
            let validationResult = validationHelper.isRequiredFieldNotEmpty(text, 'Token');
            this.setState({
              token: text,
              tokenValidated: validationResult.validated,
              tokenError: validationResult.error,
            })
          }}
          placeholder='Token (required)'
          returnKeyType='done'
          style={styles.textInputView}
          value={state.token}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!state.tokenValidated && this.tokenInputEdited ? TextInputErrorColor : null}
          tintColor={!state.tokenValidated && this.tokenInputEdited ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={styles.inputErrorText}>
          {state.tokenError}
        </Text>
      </View>
    );


    let actionButtonsBar = (
      <ActionButtonsBar
        buttons={[{
          disabled: !this.canSubmit(),
          label: 'SAVE',
          onPress: this.handleSave,
        }, {
          label: 'CANCEL',
          onPress: this.handleCancel,
        }]}
      />
    );


    return (
      <SubsceneWrapper
        ref={ref => this.subsceneWrapper = ref}
        keyboardAwareScrollViewTextInputs={this.keyboardAwareScrollViewTextInputs}
        actionButtonsBar={actionButtonsBar}
      >
        {headerText}
        {titleInput}
        {messageInput}
        {notesInput}
        {emergencyInput}
        {endpointsInput}
        {sendDateAndTimeInput}
        {this.renderTargetPropertiesInput()}
        {tokenInput}
      </SubsceneWrapper>
    );
  }

}

BroadcastsAddEditForm.propTypes = {
  editing: PropTypes.bool,
  broadcast: PropTypes.object,
  properties: PropTypes.array,
};

BroadcastsAddEditForm.contextTypes = {
  showSnackbar: PropTypes.func,
};




const styles = StyleSheet.create({
  headerText: {
    fontSize: HeaderFontSize,
    lineHeight: 36,
    color: TextColor,
    marginBottom: 16,
  },
  inputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  tokenInputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    marginTop: 20,
  },
  textInputView: {
    height: 48,
  },
  textInputMultilineView: {
    height: 125,
  },
  textInput: {
    fontSize: 19,
    color: TextColor,
  },
  inputErrorText: {
    fontSize: 12,
    color: TextInputErrorColor,
    marginTop: 3,
    marginBottom: 1,
  },
  settingsGroupView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderRadius: 2,
  },
  settingsGroupLabelView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 40,
    paddingBottom: 8,
  },
  text: {
    fontSize: FontSize,
    color: TextColor,
  },
  emergencyView: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 4,
    marginTop: 40,
    borderRadius: 2,
    backgroundColor: Canvas2Color,
  },
  endpointsSettingsItemView: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  endpointsSettingsItemViewWithBottomBorder: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
  endpointsSettingsItemsWrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingLeft: 20,
    borderRadius: 2,
    backgroundColor: Canvas2Color,
  },
  pickerViewWithMarginRight: {
    height: PickerViewHeight,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
  pickerViewWithMarginLeft: {
    height: PickerViewHeight,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
  sendDateTimeItemsWrapperView: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderRadius: 2,
    backgroundColor: Canvas2Color,
  },
  targetPropertiesInputView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    borderRadius: 2,
    backgroundColor: Canvas2Color,
  },
  targetPropertiesDropdownMenu: {
    paddingTop: 14,
  },
  targetPropertiesItemsWrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingTop: 24,
  },
});


export default BroadcastsAddEditForm;
