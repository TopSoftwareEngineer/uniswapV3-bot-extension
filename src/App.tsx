/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import './App.css';
import logo from './logo.svg'
import {Home} from './pages/Home';
import {Setting} from './pages/Setting';
import {Routes, BrowserRouter , Route} from 'react-router-dom'

export default () => {
	return (
		<div className="App">
			<img src={logo} className='App-logo' alt='logo'></img>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home/>} />
					<Route path="/setting" element={<Setting/>} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}
