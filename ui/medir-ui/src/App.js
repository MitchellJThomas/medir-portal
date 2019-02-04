import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

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

class Sensor extends Component {
  render() {
    const state = this.props.state
    // Flexible formatting in the situation where humidity data isn't pressent
    const humi = () => {
      const humi_data = typeof state.humi !== 'undefined' ?
        state.humi : "--.-"
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
            <span className='tempc'>{state.temp}</span>
            <span className="dat-unit">°C</span>
          </th>
          <td>
            <span className="tempf">{state.temp}</span>
            <span className="dat-unit">°F</span>
          </td>
        </tr>
        <tr>
          {humi()}
        </tr>
      </tbody>
    </table>
  }
}

class Outlet extends Component {
  render() {
    const state = this.props.state
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

    const plugs = plug_tuples.map((plug, index) => {
      const odd_plug = typeof plug[1] !== 'undefined' ?
        <td>{(index * 2 + 1)} is {plug[1]}</td> : <td>--</td>
      return (
        <tr key={index}>
          <td>{index * 2} is {plug[0]}</td>
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
}

class DeviceTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      devices: [
        newSensor("aa11", "attic", 12.3, 82.1),
        newSensor("dd44", "garage", 19.5, 99.0),
        newOutlet("cc33", "front porch", ["off", "on", "off"]),
        newSensor("bb22", "wine cellar", 14.5),

      ]
    }
  }

  render() {
    const devices = this.state.devices.map((device) => {
      return device.type === SENSOR_DEVICE ?
        <tr key={device.id}><td><Sensor state={device}></Sensor></td></tr> :
        <tr key={device.id}><td><Outlet state={device}></Outlet></td></tr>
    })

    return (
      <table>
        <tbody>
          {devices}
        </tbody>
      </table>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-flogo" alt="logo" /> Devices
          <DeviceTable />
        </header>
      </div>
    );
  }
}

export default App;
