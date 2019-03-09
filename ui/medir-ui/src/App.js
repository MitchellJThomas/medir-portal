import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faSignOutAlt, faUserCog, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons'

library.add(faSpinner, faSignOutAlt, faUserCog, faToggleOn, faToggleOff)

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

function Outlet(props) {
  const state = props.state

  // Create doublets (touples) from a list of single items
  // ["a", "b", "c", "d"] => [["a", "b"], ["c", "d"]]
  const tuple_maker = (accumulator, value, index) => {
    if (index % 2 === 0) {
      accumulator.push([value])
    } else {
      const last = accumulator[accumulator.length - 1]
      last.push(value)
    }
    return accumulator
  }
  const plug_tuples = state.plug_state.reduce(tuple_maker, [])

  const toggle_plug = (plug_state) => {
    if (plug_state === "on") {
      return <FontAwesomeIcon icon="toggle-on" />
    } else {
      return <FontAwesomeIcon icon="toggle-off" />
    }
  }

  const plugs = plug_tuples.map((plug, index) => {
    const odd_plug = typeof plug[1] !== 'undefined' ?
      <td className='plug'><div>{(index * 2 + 1)}: {toggle_plug(plug[1])}</div>
      </td> :
      <td className='plug'>--</td>
    return (
      <tr key={index}>
        <td className='plug'><div>{index * 2}: {toggle_plug(plug[0])}</div></td>
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


class DeviceTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      devices: [
        newSensor("aa11", "attic", 12.3, 82.1),
        newSensor("dd44", "garage", 19.5, 99.0),
        newOutlet("cc33", "front porch", ["off", "on", "off", "off"]),
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
        <tr key={device.id}><td><Sensor state={device}></Sensor></td></tr> :
        <tr key={device.id}><td><Outlet state={device}></Outlet></td></tr>
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
