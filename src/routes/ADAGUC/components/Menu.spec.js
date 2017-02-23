import React from 'react';
import { default as Menu } from './Menu';
import { mount, shallow } from 'enzyme';

describe('(Component) Menu', () => {
  const funcs = {
    createMap: () => {},
    setCut: () => {},
    setMapStyle: () => {},
    setSource: () => {},
    setLayer: () => {},
    setLayers: () => {},
    setStyles: () => {},
    setStyle: () => {},
    setOverlay: () => {}
  };

  it('Renders a div', () => {
    const _component = shallow(<Menu actions={funcs} adagucProperties={{}} dispatch={() => {}} />);
    expect(_component.type()).to.eql('div');
  });

  it('Renders six buttons', () => {
    const _component = mount(<Menu actions={funcs} adagucProperties={{}} dispatch={() => {}} />);
    const buttons = _component.find('div.btn-group');
    expect(buttons.length).to.equal(6);
  });
});