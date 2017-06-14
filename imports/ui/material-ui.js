
'use strict';


import {
  MKButton,
  MKProgress,
  MKSpinner,
  MKSwitch,
  MKTextField,
  getTheme,
  setTheme
} from 'baryshok-react-native-material-kit';
import Theme from './theme';

const PrimaryColor = Theme.Palette.Primary1Color;
const PrimaryColorRGB = [ 55, 71, 79 ];
const AccentColor = Theme.Palette.Accent2Color;
const AccentColorRGB = [ 69, 90, 100 ];
const SilverColor = '#eaeaea';
const getColorRgbString = (rgb) => { return `{rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})}` };
const getColorRgbaString = (rgb, a) => { return `{rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})}` };


const materialUITheme = {
  primaryColor: PrimaryColor,
  primaryColorRGB: getColorRgbString(PrimaryColorRGB),
  accentColor: AccentColor,
  accentColorRGB: getColorRgbString(AccentColorRGB),
  //bgPlain: 'rgba(158, 158, 158, 0.2)',
  //bgDisabled: 'rgba(0, 0, 0, 0.12)',
  fontColor: PrimaryColor,
  fontSize: 14,
  //rippleColor: 'rgba(255, 255, 255, 0.125)',
  textfieldStyle: {
    tintColor: Theme.Palette.TextInputTintColor,
    highlightColor: Theme.Palette.TextInputHighlightColor,
    //textInputStyle: {
      //color: new AttrReference('fontColor'),
      //fontSize: 16,
      //paddingLeft: 0,
      //paddingRight: 0,
    //},
  },
  //progressStyle: {
    //backgroundColor: new RGBAttrReference('primaryColorRGB', 0.3),
    //progressColor: primaryColorRef,
    //bufferColor: new RGBAttrReference('primaryColorRGB', 0.3),
  //},
  spinnerStyle: {
    strokeColor: PrimaryColor, //[
      //MKColor.palette_blue_400,
      //MKColor.palette_red_500,
      //MKColor.palette_yellow_600,
      //MKColor.palette_green_500,
    //],
  },
  //sliderStyle: {
    //lowerTrackColor: primaryColorRef,
    //upperTrackColor: '#cccccc',
  //},
  //iconToggleStyle: {
    //onColor: new RGBAttrReference('primaryColorRGB', 0.4),
    //offColor: 'rgba(0, 0, 0, 0.25)',
    //rippleColor: new AttrReference('bgPlain'),
  //},
  switchStyle: {
    onColor: getColorRgbaString(PrimaryColorRGB, 0.4),
    offColor: 'rgba(0, 0, 0, 0.25)',
    thumbOnColor: PrimaryColor,
    thumbOffColor: SilverColor,
    rippleColor: getColorRgbaString(PrimaryColorRGB, 0.2),
  },
  //radioStyle: {
    //borderOnColor: primaryColorRef,
    //borderOffColor: primaryColorRef,
    //fillColor: primaryColorRef,
    //rippleColor: new RGBAttrReference('primaryColorRGB', 0.2),
  //},
  //checkboxStyle: {
    //borderOnColor: primaryColorRef,
    //borderOffColor: 'rgba(0, 0, 0, 0.56)',
    //fillColor: primaryColorRef,
    //rippleColor: new RGBAttrReference('primaryColorRGB', 0.2),
    //inset: 0,
  //},
  //cardStyle: {
    //flex: 1,
    //backgroundColor: '#ffffff',
    //borderRadius: 2,
    //borderColor: '#ffffff',
    //borderWidth: 1,
    //shadowColor: 'rgba(0, 0, 0, 0.12)',
    //shadowOpacity: 0.8,
    //shadowRadius: 2,
    //shadowOffset: {
      //height: 1,
      //width: 2,
    //},
  //},
  //cardImageStyle: {
    //flex: 1,
    //height: 170,
    //resizeMode: 'cover',
  //},
  //cardTitleStyle: {
    //position: 'absolute',
    //top: 120,
    //left: 26,
    //backgroundColor: 'transparent',
    //padding: 16,
    //fontSize: 24,
    //color: '#000000',
    //fontWeight: 'bold',
  //},
  //cardContentStyle: {
    //padding: 15,
    //color: 'rgba(0, 0, 0, 0.54)',
  //},
  //cardActionStyle: {
    //borderStyle: 'solid',
    //borderTopColor: 'rgba(0, 0, 0, 0.1)',
    //borderTopWidth: 1,
    //padding: 15,
  //},
  //cardMenuStyle: {
    //position: 'absolute',
    //top: 16,
    //right: 16,
    //backgroundColor: 'transparent',
  //},
};

setTheme(materialUITheme);


export { MKButton, MKProgress, MKSpinner, MKSwitch, MKTextField, getTheme };
