import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Onboarding1 from './Pages/onboarding1'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Onboarding1 />
  )
}

export default App
