import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faSignOutAlt, faUserCog, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons'

library.add(faSpinner, faSignOutAlt, faUserCog, faToggleOn, faToggleOff)


function Nav(props) {
  return (
    <div id="nav">
      <img src={logo} className="logo" alt="logo" />
      <span className="user"> mthomas</span>
      <span className="nav"><FontAwesomeIcon icon="sign-out-alt" /> Sign out</span>
      <span className="nav"><FontAwesomeIcon icon="user-cog" />Settings</span>
    </div>)
}

function Sensor(props) {
  const state = props.state

  // Flexible formatting in the situation where humidity data isn't pressent
  const humi = () => {
    const humi_data = typeof state.humi !== 'undefined' ?
      state.humi.toFixed(1) : "--.-"
    return <td>
      <span className="humid">{humi_data}</span>
      <span className="dat-unit">%</span>
    </td>
  }

  return <table>
    <tbody>
      <tr>
        <th className='time'>
          <span className='tdate'>{state.ts}</span>
        </th>
        <td className='core'>{state.name}</td>
      </tr>
      <tr>
        <th rowSpan="2">
          <span className='tempc'>{state.temp.toFixed(1)}</span>
          <span className="dat-unit">°C</span>
        </th>
        <td>
          <span className="tempf">{state.temp.toFixed(1)}</span>
          <span className="dat-unit">°F</span>
        </td>
      </tr>
      <tr>
        {humi()}
      </tr>
    </tbody>
  </table>
}

function OutletSocket({ key, index, onOff, onClick }) {
  const toggle_plug = (state) => {
    if (state === "on") {
      return <FontAwesomeIcon icon="toggle-on" />
    } else {
      return <FontAwesomeIcon icon="toggle-off" />
    }
  }
  return <td key={key} className='plug'>
    <div onClick={onClick}> {index}: {toggle_plug(onOff)} </div>
  </td>
}

function EmptySocket() {
  return <td className='plug'>--</td>
}

function Outlet(props) {
  const state = props.state


  const togglePlug = () => {
    const update = state.plug_state.slice()
    update[0] = "off"
    state.plug_state = update
    this.setState({ state });
  };

  // Create doublets (touples) from a list of single items
  // ["a", "b", "c", "d"] => [["a", "b"], ["c", "d"]]
  // or for odd sized lists
  // ["a", "b", "c"] => [["a", "b"], ["c"]]
  const tuple_maker = (accumulator, value, index) => {
    const socket = <OutletSocket key={state.id + index}
      index={index} state={value} onClick={togglePlug} />
    if (index % 2 === 0) {
      accumulator.push([socket])
    } else {
      const last = accumulator[accumulator.length - 1]
      last.push(socket)
    }
    return accumulator
  }
  const plug_tuples = state.plug_state.reduce(tuple_maker, [])

  const plugs = plug_tuples.map((plug_tuple, index) => {
    const odd_plug = typeof plug_tuple[1] !== 'undefined' ? plug_tuple[1] : <EmptySocket />
    return (
      <tr key={index}>
        {plug_tuple[0]}
        {odd_plug}
      </tr>
    )
  })

  return <table>
    <tbody>
      <tr>
        <th className='time'>
          <span className='tdate'>{state.ts}</span>
        </th>
        <td className='core'>{state.name}</td>
      </tr>
      {plugs}
    </tbody>
  </table>
}


const OUTLET_DEVICE = "outlet"
const SENSOR_DEVICE = "sensor"

function newSensor(id, name, temperature, humidity) {
  return {
    id: id,
    name: name,
    ts: new Date().toLocaleTimeString(),
    temp: temperature,
    humi: humidity,
    type: SENSOR_DEVICE
  }
}

function newOutlet(id, name, plug_state) {
  return {
    id: id,
    name: name,
    ts: new Date().toLocaleTimeString(),
    plug_state: plug_state,
    type: OUTLET_DEVICE
  }
}

class DeviceTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      devices: [
        newSensor("aa11", "attic", 12.3, 82.1),
        newSensor("dd44", "garage", 19.5, 99.0),
        newOutlet("cc33", "front porch", ["off", "on", "off", "on"]),
        newSensor("bb22", "wine cellar", 14.5),
      ]
    }
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      4000
    );

  }

  tick() {
    const device_update = this.state.devices.slice()
    device_update[0].ts = new Date().toLocaleTimeString()
    device_update[0].temp += Math.random()
    device_update[0].humi += Math.random()


    if (Math.random() < 0.4) {
      device_update[1].ts = new Date().toLocaleTimeString()
      device_update[1].temp += Math.random()
      device_update[1].humi += Math.random()
    }
    if (Math.random() < 0.4) {
      device_update[3].ts = new Date().toLocaleTimeString()
      device_update[3].temp += Math.random()
    }

    this.setState(device_update);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const devices = this.state.devices.map((device) => {
      return device.type === SENSOR_DEVICE ?
        <tr key={device.id}><td><Sensor state={device} /></td></tr> :
        <tr key={device.id}><td><Outlet state={device} /></td></tr>
    })

    return (
      <div id="devices">
        <table>
          <tbody>
            {devices}
          </tbody>
        </table>
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <Nav />
        <DeviceTable />
      </div>
    );
  }
}

export default App;
