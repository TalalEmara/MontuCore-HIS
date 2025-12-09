import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CaseView from './pages/CaseView/CaseView'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CaseView/>
    </>
  )
}

export default App
