import React from 'react';
import { connect } from 'react-redux';
import { createMap } from '../actions/ADAGUC_actions';
/*eslint-disable */

class ADAGUC extends React.Component {
  constructor () {
    super();
    this.animateLayer = this.animateLayer.bind(this);
    this.resize = this.resize.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.setActiveBaseLayer = this.setActiveBaseLayer.bind(this);
  }
  currentLatestDate = undefined;
  currentBeginDate = undefined;

  updateAnimation (layer) {
    var timeDim = layer.getDimension('time');
    var numTimeSteps = timeDim.size();

    var numStepsBack = Math.min(timeDim.size(), 25);
    this.currentLatestDate = timeDim.getValueForIndex(numTimeSteps - 1);
    this.currentBeginDate = timeDim.getValueForIndex(numTimeSteps - numStepsBack);
    $('#debug').html('Latest date: ' + this.currentLatestDate);
    var dates = [];
    for (var j = numTimeSteps - numStepsBack; j < numTimeSteps; ++j) {
      dates.push({ name:timeDim.name, value:timeDim.getValueForIndex(j) });
    }
    this.webMapJS.draw(dates);
    setTimeout(function () { layer.parseLayer(this.updateAnimation, true); }, 10000);
  }

  animateLayer (layer) {
    this.webMapJS.setAnimationDelay(200);
    this.updateAnimation(layer);
    layer.onReady = undefined;
  }

  resize () {
    // eslint-disable-next-line no-use-before-define
    this.webMapJS.setSize($(window).width() - 250, $(window).height());
  }

  setActiveBaseLayer () {
    this.baselayers.map((layer) => { layer.enabled = layer.name === this.props.mapType.name; });
  }

  initAdaguc (domElement) {
    if (domElement === null || this.props.adagucProperties.mapCreated === true) {
      return;
    }
    console.log('initAdaguc', this.props);
    const { adagucProperties } = this.props;
    var username = 'terpstra';
    var url = ['http://localhost/~', username, '/adagucviewer/webmapjs'].join('');
    this.webMapJS = new WMJSMap(domElement);
    this.webMapJS.setBaseURL(url);
    $(window).resize(this.resize);
   // this.webMapJS.setSize($( window ).width(),$( window ).height() - 43);
    this.webMapJS.setSize($(window).width() - 250, $(window).height());

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.join());
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.mapType)]);
    this.props.dispatch(createMap());
  }

  componentWillUnmount () {
    this.webMapJS.destroy();
  }
  componentDidUpdate (prevProps, prevState) {
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    var { layer, mapType, boundingBox } = this.props.adagucProperties;
    if (!prevProps.adagucProperties.mapCreated || layer !== prevProps.adagucProperties.layer) {
      var newDataLayer = new WMJSLayer(layer);
      // Stop the old animation
      this.webMapJS.stopAnimating();
      // Start the animation of th new layer
      newDataLayer.onReady = this.animateLayer;
      // Remove all present layers
      this.webMapJS.removeAllLayers();
      // And add the new layer
      this.webMapJS.addLayer(newDataLayer);
      this.webMapJS.setActiveLayer(newDataLayer);
      // console.log('switched layers');
    } else if (mapType !== prevProps.adagucProperties.mapType) {
      this.webMapJS.setBaseLayers([new WMJSLayer(mapType)]);
    } else {
      this.webMapJS.setBBOX(boundingBox.join());
    }
  }

  render () {
    return <div ref={(elem) => { this.initAdaguc(elem); this.map_component = elem; }} />;
  }
}
ADAGUC.propTypes = {
  adagucProperties: React.PropTypes.object,
  store: React.PropTypes.object,
  dispatch: React.PropTypes.func
};

export default connect()(ADAGUC);
/*eslint-enable */
