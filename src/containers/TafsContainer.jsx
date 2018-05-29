import React, { Component } from 'react';
import { Col, Card, CardHeader, Badge } from 'reactstrap';
import { Icon } from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';
import Taf from '../components/Taf/Taf';
import ContainerHeader from '../components/Taf/ContainerHeader';
import TafSelector from '../components/Taf/TafSelector';
import moment from 'moment';
import { ReadLocations } from '../utils/admin';
let ITEMS;

const DATETIME_FORMAT = ('YYYY-MM-DD[T]HH:mm:ss[Z]');

export default class TafsContainer extends Component {
  constructor (props) {
    super(props);
    ITEMS = [
      {
        title: 'Open active TAFs',
        ref:   'active-tafs',
        icon: 'folder-open',
        source: this.props.urls.BACKEND_SERVER_URL + '/tafs?active=true',
        editable: false,
        tafEditable: false,
        isOpenCategory: false,
        tafStatus: 'published' // Used to render proper filters
      }, {
        title: 'Open concept TAFs',
        ref:   'concept-tafs',
        icon: 'folder-open-o',
        source: this.props.urls.BACKEND_SERVER_URL + '/tafs?active=false&status=concept',
        editable: false,
        tafEditable: true,
        isOpenCategory: false,
        tafStatus: 'concept'
      }, {
        title: 'Create new TAF',
        ref:   'add-taf',
        icon: 'star-o',
        editable: true,
        tafEditable: true,
        isOpenCategory: true,
        tafStatus: 'new'
      }
    ];

    let isOpenCategory = {};
    ITEMS.forEach((item, index) => {
      isOpenCategory[item.ref] = item.isOpenCategory;
    });
    this.state = {
      isOpen: true,
      isOpenCategory: isOpenCategory,
      isFixed: true,
      tafLocations: [],
      tafTimestamps: {},
      selectableTafs: [],
      selectedTaf: null
    };
    this.toggle = this.toggle.bind(this);
    this.toggleCategory = this.toggleCategory.bind(this);
    this.myForceUpdate = this.myForceUpdate.bind(this);
    this.openField = this.openField.bind(this);
    this.focusTaf = this.focusTaf.bind(this);
    this.generateCurrentAndNextTafTimestamp = this.generateCurrentAndNextTafTimestamp.bind(this);
    this.fetchTafLocations = this.fetchTafLocations.bind(this);
    this.setSpaceTimeTafs = this.setSpaceTimeTafs.bind(this);
  }

  toggle () {
    /* Toggles expand left /right of TAF product panel */
    this.setState({ isOpen: !this.state.isOpen });
  }

  toggleCategory (category) {
    let isOpenCategory = Object.assign({}, this.state.isOpenCategory);
    isOpenCategory[category] = !this.state.isOpenCategory[category];
    this.setState({ isOpenCategory: isOpenCategory });
  }

  openField (field) {
    let isOpenCategory = Object.assign({}, this.state.isOpenCategory);
    ITEMS.forEach((item, index) => {
      isOpenCategory[item.ref] = false;
    });
    isOpenCategory[field] = true;
    this.setState({ isOpenCategory: isOpenCategory });
  }

  myForceUpdate () {
    /* TODO find a good way to refresh the list of tafs properly */
    // this.setState(this.state);
    // this.forceUpdate();
    this.toggleCategory('concept-tafs');
    this.toggleCategory('concept-tafs');
    this.toggleCategory('active-tafs');
    this.toggleCategory('active-tafs');
  }

  focusTaf (taf) {
    let id = 'concept-tafs';
    if (taf.metadata.status === 'published') id = 'active-tafs';
    this.openField(id);
    this.refs[id].setExpandedTAF(taf.metadata.uuid, false, true);
  }

  /**
   * Retrieve locations for TAF creation from backend configuration
   */
  fetchTafLocations () {
    if (!this.props.hasOwnProperty('urls') || !this.props.urls ||
    !this.props.urls.hasOwnProperty('BACKEND_SERVER_URL') || typeof this.props.urls.BACKEND_SERVER_URL !== 'string') {
      return;
    }
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (tafLocationsData) => {
      if (tafLocationsData && typeof tafLocationsData === 'object') {
        const locationNames = [];
        tafLocationsData.forEach((location) => {
          if (location.hasOwnProperty('name') && typeof location.name === 'string' &&
          location.hasOwnProperty('availability') && Array.isArray(location.availability) && location.availability.includes('taf')) {
            locationNames.push(location.name);
          }
        });
        this.setSpaceTimeTafs(locationNames);
      } else {
        console.error('Couldn\'t retrieve TAF locations');
      }
    });
  }

  /**
   * Set the combinations for locations, current and next TAFs
   * @param {array} [tafLocations=state.tafLocations] Array of available TAF locations, as string
   * @return {object} Object containing timestamps for current and next TAFs
   */
  setSpaceTimeTafs (tafLocations = this.state.tafLocations) {
    let selectedLocation = this.state.tafSelectedLocation;
    if (!tafLocations.includes(selectedLocation)) {
      selectedLocation = tafLocations[0];
    }

    const currentAndNextTimestamps = this.generateCurrentAndNextTafTimestamp();
    const spaceTimeCombinations = this.createLocationTimeCombinations(tafLocations, currentAndNextTimestamps);
    if (tafLocations === this.state.tafLocations) {
      this.setState({
        selectableTafs: spaceTimeCombinations
      });
    } else {
      this.setState({
        tafLocations: tafLocations,
        selectedTafLocation: selectedLocation,
        selectableTafs: spaceTimeCombinations
      });
    }
  }

  /**
   * Generate timestamps for current and next TAFs
   * @return {object} Object containing timestamps for current and next TAFs
   */
  generateCurrentAndNextTafTimestamp () {
    const now = moment().utc();
    let TAFStartHour = now.hour();
    TAFStartHour = TAFStartHour - TAFStartHour % 6 + 6;
    const currentTafTimestamp = now.clone().hour(TAFStartHour).startOf('hour');
    return {
      current: currentTafTimestamp,
      next: currentTafTimestamp.clone().add(6, 'hour')
    };
  }

  createLocationTimeCombinations (locations, timestamps) {
    let combinations = [];
    const LOCATION_FORMAT = 'HH:mm';
    if (Array.isArray(locations) && timestamps && timestamps.current && timestamps.next) {
      locations.forEach((location) => {
        if (typeof location !== 'string') {
          return;
        }
        combinations.push({
          location: location,
          timestamp: timestamps.current,
          timeLabel: timestamps.current.format(LOCATION_FORMAT),
          iconName: 'folder-open-o'
        },
        {
          location: location,
          timestamp: timestamps.next,
          timeLabel: timestamps.next.format(LOCATION_FORMAT),
          iconName: 'folder-open-o'
        });
      });
    }
    return combinations;
  }

  componentWillReceiveProps (nextProps) {
    const { tafTimestamps } = this.state;
    if (!tafTimestamps || !tafTimestamps.next || moment.utc().isAfter(tafTimestamps.next)) {
      this.setSpaceTimeTafs();
    }
  }

  componentDidMount () {
    this.fetchTafLocations();
  }

  render () {
    // TODO FIX this in a better way
    let maxSize = parseInt(screen.width);
    if (document.getElementsByClassName('RightSideBar')[0]) {
      maxSize -= 2 * document.getElementsByClassName('RightSideBar')[0].clientWidth;
      maxSize += 10;
    }
    const options = this.state.selectableTafs;
    const selectedTaf = this.state.selectedTaf;
    return (
      <Col className='TafsContainer'>
        <Panel className='Panel' title={<ContainerHeader />}>
          <Col>
            <TafSelector selectableTafs={options} selectedTaf={selectedTaf} />
            {ITEMS.map((item, index) => {
              return <Card className='row accordion' key={index} >

                {!this.state.isOpen
                  ? <CardHeader >
                    <Col xs='auto'>
                      <Icon name={item.icon} />
                    </Col>
                    <Col xs='auto'>&nbsp;</Col>
                    <Col xs='auto'>
                      {item.notifications > 0 ? <Badge color='danger' pill className='collapsed'>{item.notifications}</Badge> : null}
                    </Col>
                  </CardHeader>
                  : <CardHeader className={maxSize > 0 ? null : 'disabled'} onClick={() => { this.toggleCategory(item.ref); }}>
                    <Col xs='auto'>
                      <Icon name={item.icon} />
                    </Col>
                    <Col style={{ marginLeft: '0.9rem' }}>
                      {item.title}
                    </Col>
                    <Col xs='auto'>
                      {item.notifications > 0 ? <Badge color='danger' pill>{item.notifications}</Badge> : null}
                    </Col>
                  </CardHeader>
                }
                { this.state.isOpenCategory[item.ref]
                  ? <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
                    <Taf ref={(ref) => { this.refByName[item.ref] = ref; }} user={this.props.user} focusTaf={this.focusTaf} browserLocation={this.props.location} urls={this.props.urls} {...item} latestUpdateTime={moment.utc()} fixedLayout={this.state.isFixed} updateParent={this.myForceUpdate} fixedLayout={this.state.isFixed} />
                  </CollapseOmni> : ''
                }
              </Card>;
            }
            )}
          </Col>
        </Panel>
      </Col>);
  }
}
