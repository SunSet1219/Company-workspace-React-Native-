
'use strict';


import { Platform } from 'react-native';
import Colors from './colors';


const Theme = {
  Palette: {
    ActiveColor: '#ff6347',
    InactiveColor: 'rgba(0, 0, 0, 0.4)',

    AccentColorNew: '#ff6347',
    Canvas1ColorNew: '#f4f4f4',
    MainTextColorNew: '#333333',

    Primary1Color: Colors.blueGrey800,
    Primary2Color: Colors.blueGrey700,

    Secondary1Color: Colors.grey600,
    Secondary2Color: Colors.grey500,

    Accent1Color: Colors.blueGrey800,
    Accent2Color: Colors.blueGrey700,

    TextColor: Colors.grey900,
    WhiteTextColor: '#fbfbfb',
    GreyTextColor: Colors.grey500,
    GreenTextColor: Colors.green500,
    RedTextColor: Colors.red500,

    Canvas1Color: Colors.white,
    Canvas2Color: Colors.grey100,
    Canvas3Color: '#d9d2ca',
    Canvas4Color: '#aaa49e',
    Canvas5Color: 'rgba(255, 255, 255, 0.85)',
    Canvas6Color: '#dedede',

    Border1Color: Colors.grey300,
    Border2Color: Colors.grey600,
    Border3Color: Colors.blueGrey900,

    StatusBarColor: 'rgba(0, 0, 0, 0.22)',
    StatusBarColorNew: 'rgba(0, 0, 0, 0.35)',

    ModalOverlayColor: 'rgba(0, 0, 0, 0.4)',

    TextInputTintColor: Colors.grey400,
    TextInputHighlightColor: Colors.blueGrey800,
    TextInputErrorColor: 'red',

    SuccessIconColor: Colors.green500,
    ErrorIconColor: Colors.red500,

    FlatActionButtonLabelColor: Colors.blueGrey800,
    FlatDisabledButtonLabelColor: Colors.grey400,

    RaisedDisabledButton1Color: Colors.grey300,
    RaisedDisabledButton2Color: Colors.grey500,
    RaisedDisabledButtonLabel1Color: Colors.grey500,
    RaisedDisabledButtonLabel2Color: Colors.white,

    MKButtonMaskColor: 'rgba(0, 0, 0, 0.02)',
    MKButtonRippleColor: 'rgba(0, 0, 0, 0.025)',
    MKButtonMaskColor2: 'rgba(255, 255, 255, 0.075)',
    MKButtonRippleColor2: 'rgba(255, 255, 255, 0.05)',

    MenuHighlightColor: '#bb9f7d',
  },

  Font: {
    RegularFontSettings: Platform.select({
      ios: {
        fontFamily: 'Gotham',
        fontWeight: '500',
      },
      android: {
        fontFamily: 'gotham',
      },
    }),
    SemiBoldFontSettings: Platform.select({
      ios: {
        fontFamily: 'Gotham',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'gotham-semibold',
      },
    }),
    BoldFontSettings: Platform.select({
      ios: {
        fontFamily: 'Gotham',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'gotham-bold',
      },
    }),
    ActionButtonLabelFontSizeNew: 16.5,
    ActionButtonLabelFontSize: 16,
    ActionButtonLabelFontSize2: 14,
    HeaderFontSize: 24,
    HeaderFontSizeNew: 22,
    MenuFontSize: 16,
    ModalTitleFontSize: 19,
    SubmissionResponseFontSize: 16,
    TextFontSize: 16,
    TextInputFontSize: 18,
    TextInputErrorFontSize: 12,
    TitleBarFontSize: 14,
  },
};


export default Theme;
