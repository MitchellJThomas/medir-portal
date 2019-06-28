import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faSignOutAlt, faUserCog, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons'
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { PrivateRoute, LoginPage } from './components';
import { sensorService } from './_services'

library.add(faSpinner, faSignOutAlt, faUserCog, faToggleOn, faToggleOff)

function Nav(props) {
  return (
    <div id="nav">
      <img src={logo} className="logo" alt="logo" />
      <span className="user"> {props.username}</span>
      <span className="nav"><a href="/login"><FontAwesomeIcon icon="sign-out-alt" />Sign out</a></span>
      <span className="nav"><FontAwesomeIcon icon="user-cog" />Settings</span>
    </div>)
}

function Sensor(props) {
  const state = props.state

  // Flexible formatting in the situation where humidity data isn't pressent
  const humi = () => {
    const humi_data = state.humi !== undefined ?
      state.humi.toFixed(1) : "--.-"
    return <tr key="humi"><td>
      <span className="humid">{humi_data}</span>
      <span className="dat-unit">%</span>
    </td></tr> 
  }


  const temp = () => {
    const temp_data_f = state.temp !== undefined ?  
      state.temp.toFixed(1) : "-.-"
    const temp_data_c = state.temp !== undefined ? 
      state.temp.toFixed(1) : "-.-"
    return <tr key="temp">
        <th rowSpan="2">
          <span className='tempc'>{temp_data_c}</span>
          <span className="dat-unit">°C</span>
        </th>
        <td>
          <span className="tempf">{temp_data_f}</span>
          <span className="dat-unit">°F</span>
        </td>
      </tr>
  }

  const offline = 
    <tr><td>Sensor is offline</td></tr>

  return <table>
    <tbody>
      <tr>
        <th className='time'>
          <span className='tdate'>{state.ts}</span>
        </th>
        <td className='core'>{state.name}</td>
      </tr>
      {state.online === true ? [temp(), humi()] : offline}
    </tbody>
  </table>
}

function OutletSocket({ id, index, onOff, onClick }) {
  const iconOnOff = (onOff) => {
    if (onOff === "on") {
      return <FontAwesomeIcon icon="toggle-on" />
    } else {
      return <FontAwesomeIcon icon="toggle-off" />
    }
  }
  return <td key={id + index} className='plug'>
    <div onClick={onClick} > {index}: {iconOnOff(onOff)} </div>
  </td>
}

function EmptySocket() {
  return <td className='plug'>--</td>
}

function Outlet(props) {
  const state = props.state

  // Create doublets (touples) from a list of single items
  // ["a", "b", "c", "d"] => [["a", "b"], ["c", "d"]]
  // or for odd sized lists
  // ["a", "b", "c"] => [["a", "b"], ["c"]]
  const tuple_maker = (accumulator, value, index) => {
    const socket = <OutletSocket id={state.id}
      index={index} onOff={value} onClick={() => props.onClick(index)} />
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

  const offline = 
    <tr><td>Outlet is offline</td></tr>

  return <table>
    <tbody>
      <tr>
        <th className='time'>
          <span className='tdate'>{state.ts}</span>
        </th>
        <td className='core'>{state.name}</td>
      </tr>
      { state.online === true ? plugs : offline }
    </tbody>
  </table>
}

 // eslint-disable-next-line
function newSensor(id, name, temperature, humidity) {
  return {
    id: id,
    name: name,
    ts: new Date().toLocaleTimeString(),
    temp: temperature,
    humi: humidity,
    type: sensorService.sensorType.SENSOR_DEVICE
  }
}
 
// eslint-disable-next-line
function newOutlet(id, name, plug_state) {
  return {
    id: id,
    name: name,
    ts: new Date().toLocaleTimeString(),
    plug_state: plug_state,
    type: sensorService.sensorType.OUTLET_DEVICE
  }
}

class DeviceTable extends Component {
  constructor(props) {
    super(props)
      this.state = {devices: {}}
  }

  toggleOutletSocket(device) {
    return (plugId) => {
      if (device.type === sensorService.sensorType.OUTLET_DEVICE) {
        // Wow, this seems like too much copy behavior... scratches chin
        const updatedDevices = Object.assign({}, this.state.devices)
        const updatedOutletSocket = Object.assign({}, device)
        updatedDevices[updatedOutletSocket.id] = updatedOutletSocket
        const newPlugState = updatedOutletSocket.plug_state.slice()
        updatedOutletSocket.plug_state = newPlugState
        if (newPlugState[plugId] === "on") {
          newPlugState[plugId] = "off"
        } else {
          newPlugState[plugId] = "on"
        }
        this.setState({devices: updatedDevices} )
      }
    }
  }

  componentDidMount() {
    // TODO make this poll every so often, say 5 minutes?
    sensorService.getSensors().then(sensors => {
        if (sensors) {
          this.setState({devices: sensors})
        }
      }).catch( err =>  console.error(err))
  }

  render() {
    const devices = Object.values(this.state.devices).map(device => {
        return device.type === sensorService.sensorType.SENSOR_DEVICE ?
        <tr key={device.id}><td><Sensor state={device} /></td></tr> :
        <tr key={device.id}><td><Outlet state={device} onClick={this.toggleOutletSocket(device)} /></td></tr>
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

function HomePage(props) {
    return (
      <div className="Homepage">
        <Nav username={props.username}/>
        <DeviceTable />
      </div>
    )
}

class App extends Component {
  render() {
    return (
      <div className="App">
         <Router>
          <div>
              <PrivateRoute exact path="/" component={HomePage} />
              <Route path="/login" component={LoginPage} />
          </div>
         </Router>
      </div>
    )
  }
}

export default App;
