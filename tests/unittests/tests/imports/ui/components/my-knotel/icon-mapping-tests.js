import assert from 'assert';
import IconMapping from '../../../../../../../imports/ui/components/my-knotel/icon-mapping';


describe('IconMapping', () => {
  it('should return a proper mobile icon name for a known webapp icon', () => {
    const result = IconMapping('NotificationWifi');
    assert.strictEqual(result, 'wifi');
  });
  it('should return an empty string for a wrong icon name', () => {
    const result = IconMapping('abc');
    assert.strictEqual(result, '');
  });
  it('should return an empty string when undefined is passed as a parameter', () => {
    const result = IconMapping();
    assert.strictEqual(result, '');
  });
});
