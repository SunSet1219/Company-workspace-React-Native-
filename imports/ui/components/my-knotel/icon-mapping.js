const iconsMapping = {
  ActionThreeDRotation: '3d-rotation',
  ImageCrop169: 'crop-16-9',
  ImageCrop32: 'crop-3-2',
  ImageCrop54: 'crop-5-4',
  ImageCrop75: 'crop-7-5',
};

const getMobileIconNameFromWebIconName = (iconName='') => {
  return iconsMapping[iconName] || iconName.replace(/[A-Z]|[0-9]+/g, charactor => `-${charactor.toLowerCase()}`)
      .split('-').filter(String).slice(1).join('-');
};

export default getMobileIconNameFromWebIconName;
