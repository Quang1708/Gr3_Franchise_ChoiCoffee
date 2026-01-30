import { Suspense } from "react"
import { BrowserRouter } from "react-router-dom"
import ClientAuthRoutes from "./routes/client/ClientAuth.route"

function App() {

  return (
    <BrowserRouter>
      <Suspense>
        <Routs>
           {/* Admin */}
           {ClientAuthRoutes}
        </Routs>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
