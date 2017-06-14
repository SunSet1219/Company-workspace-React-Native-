
'use strict';


import React, {
  createElement,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Markdown from 'react-native-simple-markdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconMapping from './icon-mapping';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';
import _ from 'underscore';

const { TextColor } = Theme.Palette;
const { MyKnotelContainerPaddingHorizontal } = UISharedConstants;
const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  )
};
const ImageSize = Display.ShortSide - 100;

const MarkdownTextWithIcon = (props) => {

  const replaceHeaderInYaml = (content) => {
    while (content.search(/#+ .*?\n/gm) >= 0) {
      const headerStartPosition = content.search(/#+ .*?\n/gm);
      const spacePosition = content.indexOf(' ', headerStartPosition);
      const newLinePosition = content.indexOf('\n', headerStartPosition);
      let replacedValue = content.substr(spacePosition + 1, newLinePosition - spacePosition - 1);
      let headerLength = '';
      for (let i = spacePosition - headerStartPosition; i > 0; i--) {
        headerLength += '#';
      }
      let replacedContent = headerLength + replacedValue + headerLength + '\n\n';
      content = content.replace(/#+ .*?\n/, replacedContent)
    }
    return content;
  }


  const iconName = IconMapping(props.iconName);
  const icon = iconName ? (
    <Icon
      name={iconName}
      size={28}
    />
  ) : null;


  const iconLabel = props.iconLabel ? (
    <Text style={styles.iconText}>
      {props.iconLabel}
    </Text>
  ) : null;


  const markdounRules = {
    image: {
      react: (node, output, state) => (
        <Image
          style={styles.pastedImage}
          key={state.key}
          source={{ uri: node.target }}
        />
      ),
    },
    list: {
      react: (node, output, state) => {
        const items = _.map(node.items, (item, i) => {
          const bullet = createElement(Text, { key: state.key }, '\u2022 ')
          const listItemText = createElement(Text, { key: state.key + 1 }, output(item, state))
          return createElement(View, {
            key: i,
            style: styles.listItem
          }, [ bullet, listItemText ])
        })
        return createElement(View, { key: state.key, style: styles.list }, items)
      }
    },
  }


  return (
    <View style={styles.wrapperView}>
      <View style={styles.iconView}>
        { icon }
        { iconLabel }
      </View>
      <View style={styles.markdownView}>
        <Markdown
          styles={{
            heading: {
              fontWeight: '600',
            }
          }}
          rules={ markdounRules }
        >
          { replaceHeaderInYaml(props.content) }
        </Markdown>
      </View>
    </View>
  );

};

MarkdownTextWithIcon.propTypes = {
  iconName: PropTypes.string,
  iconLabel: PropTypes.string,
  content: PropTypes.string,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingRight: 16,
    paddingVertical: 12,
  },
  iconView: {
    width: 64,
    marginTop: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingRight: MyKnotelContainerPaddingHorizontal,
  },
  iconLabel: {
    fontSize: 12,
    color: TextColor,
  },
  markdownView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  pastedImage: {
    width: ImageSize,
    height: ImageSize,
    marginTop: 5
  },
  listItem: {
    flex: 1,
    flexDirection: 'row'
  },
  list: {
    paddingHorizontal: 10
  },
});


export default MarkdownTextWithIcon;
